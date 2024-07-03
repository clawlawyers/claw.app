const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema({
  path: String,
  visitDuration: Number,
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, default: null },
  visitorId: { type: String, default: null },
});

const Tracking = mongoose.model("Tracking", trackingSchema);

module.exports = Tracking;
