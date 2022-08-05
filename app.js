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
    sameSite: "none",
  })
);

var allowedDomains = [process.env.CLIENT_HOME_PAGE_URL, process.env.API_URL];

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // bypass the requests with no origin (like curl requests, mobile apps, etc )
      if (!origin) return callback(null, true);

      if (allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }, // allow to server to accept request from different origin
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
