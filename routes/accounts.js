
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

/* POST Login */

router.post('/login', async (req, res) => {
  // validaciones
  const { error } = accountSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message })
  
  const {result} = await accounts.getAccountByEmail(req.body);
  if (result.length < 1) return res.status(400).json({ error: 'User not found' });

  const account = result[0];

  const validPassword = await bcrypt.compare(req.body.password, account.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid Password' })
  
  res.json({
      error: null,
      data: 'Successfull login!'
  });
})

module.exports = router;
