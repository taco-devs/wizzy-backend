var express = require("express");
var router = express.Router();
const passport = require("passport");
const TwitterStrategy = require("passport-twitter");
const accounts = require("../services/accounts");
const short = require("short-uuid");
const jwt = require("jsonwebtoken");
const uniquenames = require('unique-names-generator');

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser(async (account, done) => {
  done(null, account);
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser(async (account, done) => {
  // find current user
  const response = await accounts.getAccountByEmail(account);

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

// when login is successful, retrieve user info
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: "user has successfully authenticated",
      user: req.user,
      cookies: req.cookies,
    });
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
  res.redirect(process.env.CLIENT_HOME_PAGE_URL);
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

    const token = jwt.sign(
      {
        slug_id: req.user.slug_id,
      },
      process.env.TOKEN_SECRET
    );

    res.redirect(process.env.CLIENT_HOME_PAGE_URL + "/auth?token=" + token);
  }
);

module.exports = router;
