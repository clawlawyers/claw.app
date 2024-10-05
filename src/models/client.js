const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, // Track session creation
  lastActive: { type: Date, default: Date.now }, // Track session activity (heartbeat/ping)
});

const clientSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    collegeName: { type: String, trim: true },
    profilePicture: { type: String, trim: true },
    phoneNumber: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    registered: { type: Boolean, default: false },
    ambassador: { type: Boolean, default: false },
    account: {
      holderName: { type: String, trim: true },
      number: { type: Number },
      ifsc: { type: String, trim: true },
    },
    engagementTime: {
      daily: { type: Map, of: Number, default: {} },
      monthly: { type: Map, of: Number, default: {} },
      yearly: { type: Map, of: Number, default: {} },
      total: {
        type: Number,
        default: 0,
      },
    },
    sessions: [sessionSchema], // Store multiple session information with timestamps
  },
  { timestamps: true }
);

clientSchema.index({ "engagementTime.daily": 1 });
clientSchema.index({ "engagementTime.monthly": 1 });
clientSchema.index({ "engagementTime.yearly": 1 });

const Client = new mongoose.model("Client", clientSchema);

module.exports = Client;
