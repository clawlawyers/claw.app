const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual case history subdocument schema
const CaseHistorySchema = new Schema({
  caseDetails: { type: String, required: true },
  arguments: { type: String, required: true },
  conclusion: { type: String, required: true },
  verdict: { type: String, default: "NA" },
});

// Define the courtroom history schema
const CourtroomHistorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    slot: {
      date: { type: Date, required: true },
      hour: { type: Number, required: true, min: 0, max: 23 },
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
