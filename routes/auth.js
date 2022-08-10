var express = require("express");
var router = express.Router();
const passport = require("passport");
const TwitterStrategy = require("passport-twitter");
const LocalStrategy = require("passport-local");
const accounts = require("../services/accounts");
const short = require("short-uuid");
const jwt = require("jsonwebtoken");
const uniquenames = require("unique-names-generator");
const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const mailer = require("../services/mailer");

const accountSchema = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
});

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser(async (account, done) => {
  console.log('serialize -->', account)
  return done(null, account);
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser(async (account, done) => {
  // find current user
  const response = await accounts.getAccountByEmail(account);

  console.log('dserialize -->', response.result[0])

  if (response.result.length < 1) done(new Error("Cannot find user"));

  return done(null, response.result[0]);
});

// Validate Object
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_KEY,
      consumerSecret: process.env.TWITTER_SECRET,
      userProfileURL:
        "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
      callbackURL: "/auth/twitter/redirect",
    },
    async (token, tokenSecret, profile, done) => {
      // find current user
      const result = await accounts.getAccountByTwitterId(profile._json.id_str);

      const account = result.account;

      if (!account) {
        // Create account
        let new_account = {};

        const slug_id = await short.generate();

        // generate random name
        const numberDictionary = uniquenames.NumberDictionary.generate({
          min: 100,
          max: 999,
        });
        const shortName = uniquenames.uniqueNamesGenerator({
          dictionaries: [
            uniquenames.adjectives,
            uniquenames.animals,
            numberDictionary,
          ],
          style: "lowerCase",
        });

        new_account.username = shortName;
        new_account.email = profile._json.email;
        new_account.slug_id = slug_id;
        new_account.twitter_id = profile._json.id_str;
        new_account.twitter_screen_name = profile._json.screen_name;
        new_account.twitter_profile_image_url_https =
          profile._json.profile_image_url_https;

        const create_result = await accounts.createTwitterAccount(new_account);

        if (create_result.result.length) {
          return done(null, create_result.result[0]);
        } else {
          throw new Error();
        }
      }

      return done(null, account);
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: true,
    },
    async (email, password, done) => {
      // validaciones

      const { error } = accountSchema.validate({ email, password });

      if (error) return done(null, null);

      const { result } = await accounts.getAccountByEmail({ email });
      if (result.length < 1) return done(null, null);
      //  return res.status(400).json({ error: "User not found" });

      const account = result[0];

      const validPassword = await bcrypt.compare(password, account.password);

      // Verify if account was verified successfully
      if (!account.verified) return done(null, null);
      // return res.status(400).json({ error: "Account not verified" });

      if (!validPassword) return done(null, null);
      // return res.status(400).json({ error: "Invalid Password" });

      return done(null, account);
    }
  )
);

// GET Account data
router.get("/token", async (req, res, next) => {
  try {
    console.log(req?.session)
    if (!req.session || !req.session.passport)
      return res.status(400).json({ error: "No active session" });

    const { user } = req.session.passport;
    const response = await accounts.getAccountByEmail(user);

    await req.session.save();

    return res.json({
      error: null,
      data: response.result[0],
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
});

// Login
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/auth/login/failed" }),
  function (req, res) {
    console.log('success: ', [process.env.CLIENT_HOME_PAGE_URL, process.env.API_URL]);
    console.log('session:', {
      name: "session",
      keys: [process.env.COOKIE_KEY],
      maxAge: 24 * 60 * 60 * 100,
      sameSite: process.env.ENV === "prod" ? 'none' : 'lax',
      secure: process.env.ENV === 'prod',
      domain: process.env.ENV === 'prod' ? process.env.CLIENT_HOME_PAGE_URL : 'localhost',
      httpOnly: process.env.ENV === 'dev'
    })
    console.log('user:', req.user);
    console.log('cookies: ', req.cookies);
    return res.redirect("/auth/login/success");
  }
);

router.post("/register", async (req, res) => {
  // Validate Object
  const { error } = accountSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Validate uniqueness
  const { result } = await accounts.getAccountByEmail(req.body);
  if (result.length > 0) {
    return res.status(400).json({ error: "account already exist" });
  }

  // Hash Passwords
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  // Generate a random slug_id
  const slug_id = short.generate();

  // generate random name
  const numberDictionary = uniquenames.NumberDictionary.generate({
    min: 100,
    max: 999,
  });
  const shortName = uniquenames.uniqueNamesGenerator({
    dictionaries: [
      uniquenames.adjectives,
      uniquenames.animals,
      numberDictionary,
    ],
    style: "lowerCase",
  });

  // Generate the verification token
  const account_token = jwt.sign(
    {
      slug_id,
    },
    process.env.TOKEN_SECRET
  );

  // Account Object
  const account = {
    username: shortName,
    slug_id,
    email: req.body.email,
    password,
    account_token,
  };

  try {
    const data = await accounts.createAccount(account);
    await mailer.sendConfirmationEmail(account.email, account_token);

    return res.json({
      error: null,
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
});

// when login is successful, retrieve user info
router.get("/login/success", (req, res) => {
  try {
    if (req.user) {
      return res.json({
        success: true,
        message: "user has successfully authenticated",
        user: req.user,
        cookies: req.cookies,
      });
    } else {
      return res.status(400).json({error: 'Invalid session'});
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: "Error in session" });
  }
});

// when login failed, send failed msg
router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "user failed to authenticate.",
  });
});

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy(function (err) {
    if (err) { return next(err); }
    // The response should indicate that the user is no longer authenticated.
    return res.json({
    success: true,
    message: "user has successfully logout",
  });
  });
  
});

// auth with twitter
router.get("/twitter", passport.authenticate("twitter"));

// redirect to home page after successfully login via twitter
router.get(
  "/twitter/redirect",
  passport.authenticate("twitter", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  function (req, res) {
    // Get JWT
    return res.redirect(process.env.CLIENT_HOME_PAGE_URL);
  }
);

router.get("/verify", async (req, res, next) => {
  const token = req.query.token;
  const { slug_id } = jwt.decode(token);

  const query = await accounts.getAccountBySlug(slug_id);

  if (query.result < 1) res.status(400).json({ error: "Invalid token" });

  if (query.result[0].account_token !== token)
    res.status(400).json({ error: "Non matching token" });

  await accounts.updateVerify(query.result[0].id);

  res.redirect(`${process.env.CLIENT_HOME_PAGE_URL}/login?verified=true`);
});

module.exports = router;
