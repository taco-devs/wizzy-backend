var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST users Sign Up */
router.post('/register', async (req, res) => {
  res.json({
      error: null,
      data: 'aquí va ir la data'
  })
})

module.exports = router;
