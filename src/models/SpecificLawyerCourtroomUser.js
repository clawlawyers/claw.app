const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courtroomFeaturesSchema = new mongoose.Schema({
  AiLawyer: {
    type: Boolean,
    required: true,
  },
  AiJudge: {
    type: Boolean,
    required: true,
  },
  AiAssistant: {
    type: Boolean,
    required: true,
  },
  FirstDraft: {
    type: Boolean,
    required: true,
  },
  Verdict: {
    type: Boolean,
    required: true,
  },
  RelevantCaseLaws: {
    type: Boolean,
    required: true,
  },
  Evidences: {
    type: Boolean,
    required: true,
  },
  LegalGPT: {
    type: Boolean,
    required: true,
  },
  MultilingualSupport: {
    type: Boolean,
    required: true,
  },
  VoiceInput: {
    type: Boolean,
    required: true,
  },
});

// Define the individual courtroom booking subdocument schema
const SpecificLawyerCourtroomUserSchema = new Schema({
  userId: { type: String },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  Domain: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  endDate: {
    type: Date,
    required: true,
  },
  recording: { type: Boolean, required: true },
  drafteFavor: { type: String },
  caseOverview: {
    type: String,
    required: true,
    default: "",
  },
  totalHours: { type: Number, required: true },
  totalUsedHours: { type: Number, required: true, default: 0 },
  features: courtroomFeaturesSchema,
});

const SpecificLawyerCourtroomUser = mongoose.model(
  "SpecificLawyerCourtroomUser",
  SpecificLawyerCourtroomUserSchema
);

module.exports = SpecificLawyerCourtroomUser;
