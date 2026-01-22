const crypto = require('crypto');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('.env file not found');
  process.exit(1);
}

const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
const webhookUrl = 'http://localhost:5000/api/payments/webhook';

// Mock Data
const orderId = 'order_Mock' + Date.now();
const paymentId = 'pay_Mock' + Date.now();
const userId = '19705d2b-2158-4cc3-a77e-d50511197777'; // Using the user ID we know exists

const payload = {
  "entity": "event",
  "account_id": "acc_BFW7Wd7b4252f9",
  "event": "order.paid",
  "contains": [
    "payment",
    "order"
  ],
  "payload": {
    "payment": {
      "entity": {
        "id": paymentId,
        "entity": "payment",
        "amount": 100,
        "currency": "INR",
        "status": "captured",
        "order_id": orderId,
        "invoice_id": null,
        "international": false,
        "method": "upi",
        "amount_refunded": 0,
        "refund_status": null,
        "captured": true,
        "description": "Test Transaction",
        "card_id": null,
        "bank": null,
        "wallet": null,
        "vpa": "test@upi",
        "email": "test@example.com",
        "contact": "+919999999999"
      }
    },
    "order": {
      "entity": {
        "id": orderId,
        "entity": "order",
        "amount": 100,
        "amount_paid": 100,
        "amount_due": 0,
        "currency": "INR",
        "receipt": "rcpt_test_1",
        "status": "paid",
        "attempts": 1,
        "notes": {
          "type": "subscription",
          "userId": userId
        },
        "created_at": 1616666666
      }
    }
  },
  "created_at": 1616666666
};

// Generate Signature
const signature = crypto.createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex');

console.log('Sending Webhook Request...');
console.log('URL:', webhookUrl);

(async () => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
