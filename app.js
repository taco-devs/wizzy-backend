const cookieSession = require("cookie-session");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const bodyparser = require("body-parser");
var logger = require("morgan");
var cors = require("cors");
var passport = require("passport");

// const session = require("express-session");

var indexRouter = require("./routes/index");
var accountsRouter = require("./routes/accounts");
var questionsRouter = require("./routes/questions");
var authRouter = require("./routes/auth");

var app = express();

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 100,
    sameSite: process.env.ENV === 'dev' ? null : "none",
    secure: process.env.ENV === 'dev' ? false : true,
    domain: process.env.ENV === 'dev' ? null : process.env.CLIENT_HOME_PAGE_URL,
    httpOnly: process.env.ENV === 'dev' ? true : false,
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
