const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual case history subdocument schema
const SpecificLawyerCaseHistorySchema = new Schema({
  argument: [{ type: String, required: true }],
  counter_argument: [{ type: String, required: true }],
  judgement: [{ type: String, required: true }],
  potential_objection: [{ type: String, required: true }],
  verdict: { type: String, default: "NA" },
});

// Define the courtroom history schema
const SpecificLawyerCourtroomHistorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SpecificLawyerCourtroomUser",
      required: true,
    },
    history: [SpecificLawyerCaseHistorySchema],
    latestCaseHistory: SpecificLawyerCaseHistorySchema,
    otherDetails: {
      type: mongoose.Schema.Types.ObjectId, // this can be extended as per requirements
      required: true,
      ref: "SpecificLawCourtroomFeature",
    },
  },
  { timestamps: true }
);

const SpecificLawyerCourtroomHistory = mongoose.model(
  "SpecificLawyerCourtroomHistory",
  SpecificLawyerCourtroomHistorySchema
);

module.exports = SpecificLawyerCourtroomHistory;
