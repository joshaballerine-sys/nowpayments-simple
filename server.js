// Simple NOWPayments demo server (Express + Axios)
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Change these if you want
const SUCCESS_URL = process.env.SUCCESS_URL || 'https://example.com/success';
const CANCEL_URL  = process.env.CANCEL_URL  || 'https://example.com/cancel';

app.post('/pay', async (req, res) => {
  try {
    const { amount, currency, description } = req.body;
    if (!process.env.NOWPAYMENTS_API_KEY) {
      return res.status(500).send('NOWPAYMENTS_API_KEY is not set on the server.');
    }

    const payload = {
      price_amount: Number(amount),
      price_currency: String(currency || 'USD').toUpperCase(),
      order_description: description || 'Order',
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL
    };

    const { data } = await axios.post('https://api.nowpayments.io/v1/invoice', payload, {
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (data && data.invoice_url) {
      // Redirect customer to NOWPayments hosted invoice page
      return res.redirect(data.invoice_url);
    } else {
      return res
        .status(400)
        .send('Invoice creation failed: ' + JSON.stringify(data));
    }
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res
      .status(500)
      .send('Error contacting NOWPayments: ' + (err?.response?.data?.message || err.message));
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
