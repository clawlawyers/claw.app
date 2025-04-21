const mongoose = require("mongoose");

const navigationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  isAuthenticated: {
    type: Boolean,
    required: true
  },
  sessionStartTime: {
    type: Date,
    required: true
  },
  navigationStep: {
    path: {
      type: String,
      required: true
    },
    previousPath: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  referrer: {
    type: String,
    default: "direct"
  },
  userAgent: {
    type: String
  },
  timeSpentOnPreviousPage: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Navigation = mongoose.model("Navigation", navigationSchema);

module.exports = Navigation;
