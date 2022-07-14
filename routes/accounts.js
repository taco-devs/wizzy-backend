
var express = require("express");
var router = express.Router();
const Joi = require("@hapi/joi");
const bcrypt = require('bcrypt');

const accounts = require('../services/accounts');

const accountSchema = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/* POST users Sign Up */
router.post("/register", async (req, res) => {
  // Validate Object
  const { error } = accountSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Validate uniqueness 
  const {result} = await accounts.getAccountByEmail(req.body);
  if (result.length > 0) {
    return res.status(400).json({ error: 'account already exist'});
  }

  // Hash Passwords
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  // Account Object
  const account = {
    username: req.body.username || req.body.email,
    email: req.body.email,
    password,
  };

  try {
    const data = await accounts.createAccount(account);
    res.json({
      error: null,
      data,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
