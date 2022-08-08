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

var app = express();

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

app.enable("trust proxy");

app.use(
  session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: true,
    proxy: true, // Required for Heroku & Digital Ocean (regarding X-Forwarded-For)
    name: "session", // This needs to be unique per-host.
    cookie: {
      maxAge: 24 * 60 * 60 * 100,
      secure: process.env.ENV === 'prod', // required for cookies to work on HTTPS
      httpOnly: process.env.ENV === 'dev',
      sameSite: process.env.ENV === "prod" ? 'none' : 'lax'
    },
  })
);

// CORS
app.use(
  cors({
    origin: [process.env.CLIENT_HOME_PAGE_URL, process.env.API_URL], // allow to server to accept request from different origin
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/accounts", accountsRouter);
app.use("/questions", questionsRouter);
app.use("/auth", authRouter);

module.exports = app;
