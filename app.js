var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const bodyparser = require("body-parser");
var logger = require("morgan");
var cors = require("cors");
var passport = require("passport");
var session = require("express-session");

var indexRouter = require("./routes/index");
var accountsRouter = require("./routes/accounts");
var questionsRouter = require("./routes/questions");
var authRouter = require("./routes/auth");
var sitemapRouter = require("./routes/sitemap");
var creditsRouter = require("./routes/credits");
var webhookRouter = require("./routes/webhook");

var { pool } = require("./services/db")

var app = express();

app.use(express.static(path.join(__dirname, "public")));

/* app.enable("trust proxy");

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 100,
    sameSite: process.env.ENV === "prod" ? 'none' : 'lax',
    secure: process.env.ENV === 'prod',
    domain: process.env.ENV === 'prod' ? process.env.CLIENT_HOME_PAGE_URL : 'localhost',
    httpOnly: process.env.ENV === 'dev'
  })
);
*/

app.set("trust proxy",1);

app.use(
  session({
    store: new (require('connect-pg-simple')(session))({
      pool,
      tableName: 'sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.COOKIE_KEY,
    resave: false,
    domain: process.env.ENV === "prod" ? process.env.CLIENT_DOMAIN : 'localhost',
    saveUninitialized: false,
    proxy: true, // Required for Heroku & Digital Ocean (regarding X-Forwarded-For)
    name: "session", // This needs to be unique per-host.
    cookie: {
      maxAge: 24 * 60 * 60 * 100,
      secure: process.env.ENV === 'prod', // required for cookies to work on HTTPS
      httpOnly: process.env.ENV === 'dev',
      sameSite: process.env.ENV === "prod" ? 'none' : 'lax',
      domain: process.env.ENV === "prod" ? process.env.CLIENT_DOMAIN : 'localhost'
    },
  })
);

// CORS
app.use(
  cors({
    origin: [process.env.CLIENT_HOME_PAGE_URL, process.env.API_URL, 'https://stripe.com '], // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
  })
);

// initalize passport
app.use(passport.initialize());
// deserialize cookie from the browser
app.use(passport.session());

// capturar body

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(logger("dev"));
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next(); // Do nothing with the body because I need it in a raw state.
  } else {
    express.json()(req, res, next);  // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
  }
});

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/accounts", accountsRouter);
app.use("/questions", questionsRouter);
app.use("/auth", authRouter);
app.use("/sitemap", sitemapRouter);
app.use("/credits", creditsRouter);
// Webhook route
app.use("/webhook", webhookRouter);

module.exports = app;
