const express = require('express');
const router = express.Router();
const questions = require('../services/questions');
const verifyToken = require('./validate-token');

/* GET questions listing. */
router.get('/', verifyToken, async function(req, res, next) {
    try {
      res.json(await questions.getMultiple(req.query.page));
    } catch (err) {
      console.error(`Error while getting questions `, err.message);
      next(err);
    }
});

// GET specific question
router.get('/:id', async function(req, res, next) {
  try {
    const question = await questions.getOneBySlug(req.params.id);
    return res.json(question);
  } catch (err) {
    console.error(`Error while getting questions `, err.message);
    next(err);
  }
});

/* POST quotes */
router.post('/',  async function(req, res, next) {
    try {
      res.json(await questions.create(req));
    } catch (err) {
      console.error(`Error while posting question `, err.message);
      next(err);
    }
});
  

module.exports = router;