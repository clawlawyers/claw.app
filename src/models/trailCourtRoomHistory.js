const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual case history subdocument schema
const TrailCaseHistorySchema = new Schema({
  argument: [{ type: String, required: true }],
  counter_argument: [{ type: String, required: true }],
  judgement: [{ type: String, required: true }],
  potential_objection: [{ type: String, required: true }],
  verdict: { type: String, default: "NA" },
});

// Define the courtroom history schema
const TrailCourtroomHistorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrailCourtroomUser",
      required: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrailCourtRoomBooking",
      required: true,
    },
    history: [TrailCaseHistorySchema],
    latestCaseHistory: TrailCaseHistorySchema,
  },
  { timestamps: true }
);

const TrailCourtroomHistory = mongoose.model(
  "TrailCourtroomHistory",
  TrailCourtroomHistorySchema
);

module.exports = TrailCourtroomHistory;
