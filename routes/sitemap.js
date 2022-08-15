const express = require('express');
const router = express.Router();
const questions = require('../services/questions');

// GET specific question
router.get('/', async function(req, res, next) {
  try {
    const all = await questions.getSitemap();
    return res.json(all);
  } catch (err) {
    console.error(`Error while getting questions `, err.message);
    next(err);
  }
});

module.exports = router;