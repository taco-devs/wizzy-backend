var express = require("express");
var router = express.Router();
const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const short = require("short-uuid");

const accounts = require("../services/accounts");
const questions = require("../services/questions");

const verifyToken = require("./validate-token");


/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// GET Account data
router.get("/me", verifyToken, async (req, res, next) => {
  const token = req.headers["auth-token"];
  const { slug_id } = jwt.decode(token);

  try {
    const response = await accounts.getAccountBySlug(slug_id);

    if (response.result.length < 1)
      return res.status(400).json({ error: "User not found" });

    const account = response.result[0];

    res.json({
      error: null,
      data: account,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
});

// GET account questions
router.get("/my-questions", verifyToken, async (req, res, next) => {
  const token = req.headers["auth-token"];
  const { slug_id } = jwt.decode(token);

  try {
    const data = await questions.getByAccount(slug_id);
    res.json({
      error: null,
      data,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});



module.exports = router;
