const mongoose = require("mongoose");

const navigationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
    },
    isAuthenticated: {
      type: Boolean,
      required: false,
    },
    sessionStartTime: {
      type: Date,
      required: false,
    },
    navigationStep: {
      path: {
        type: String,
        required: false,
      },
      previousPath: {
        type: String,
        required: false,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
    referrer: {
      type: String,
      default: "direct",
    },
    userAgent: {
      type: String,
    },
    timeSpentOnPreviousPage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Navigation = mongoose.model("Navigation", navigationSchema);

module.exports = Navigation;
