const mongoose = require("mongoose");

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

const CourtroomFeatures = mongoose.model(
  "CourtroomFeatures",
  courtroomFeaturesSchema
);
