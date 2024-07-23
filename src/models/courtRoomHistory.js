const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual case history subdocument schema
const CaseHistorySchema = new Schema({
  argument: [{ type: String, required: true }],
  counter_argument: [{ type: String, required: true }],
  judgement: [{ type: String, required: true }],
  potential_objection: [{ type: String, required: true }],
  verdict: { type: String, default: "NA" },
});

// Define the courtroom history schema
const CourtroomHistorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourtroomUser",
      required: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourtRoomBooking",
      required: true,
    },
    history: [CaseHistorySchema],
    latestCaseHistory: CaseHistorySchema,
  },
  { timestamps: true }
);

const CourtroomHistory = mongoose.model(
  "CourtroomHistory",
  CourtroomHistorySchema
);

module.exports = CourtroomHistory;
