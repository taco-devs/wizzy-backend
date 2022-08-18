var express = require('express');
var router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* GET home page. */
router.post('/initialize-session', async function(req, res, next) {
  const { item } = req.body

  const transformedItem = {
    price_data: {
      currency: 'usd',
      product_data: {
        images: [item.image],
        name: item.name,
      },
      unit_amount: item.price * 100,
    },
    description: item.description,
    quantity: item.quantity,
  };

  console.log(transformedItem);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [transformedItem],
    mode: 'payment',
    success_url: process.env.CLIENT_DOMAIN + '/add-credits?status=success',
    cancel_url: process.env.CLIENT_DOMAIN + '/add-credits?status=cancel',
    metadata: {
      images: item.image,
    },
  });
  
  res.json({ id: session.id });

});


module.exports = router;
