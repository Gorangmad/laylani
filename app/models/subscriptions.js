const mongoose = require('mongoose');

const Schema = mongoose.Schema

// Define the subscription schema
const subscriptionSchema = new Schema({
  userId: { type: String, required: false}, // Add a field for user identification if needed
  endpoint: { type: String, required: false},
  keys: {
    p256dh: { type: String, required: false},
    auth: { type: String, required: false},
  },
});

// Create a model for the subscription collection

module.exports = mongoose.model('Subscription', subscriptionSchema)