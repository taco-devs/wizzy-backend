var express = require("express");
var router = express.Router();

const accounts = require("../services/accounts");
const questions = require("../services/questions");


/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});


// GET account questions
router.get("/:username/questions", async (req, res, next) => {

  try {

    const {username} = req.params;
  
    const response = await accounts.getAccountByUsername(username);

    if (!response.result.length) return res.status(400).json({error: 'Invalid username'});

    const data = await questions.getByAccount(response.result[0].slug_id);

    res.json({
      error: null,
      data,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});



module.exports = router;
