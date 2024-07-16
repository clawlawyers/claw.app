const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Contact Us schema
const ContactUsSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    preferredContactMode: { type: String, required: true, trim: true },
    businessName: { type: String, trim: true },
    comments: { type: String, required: true, trim: true },
    queryPushedToEmail: { type: Boolean, default: false }, // Flag to indicate if the query was pushed to the email
  },
  { timestamps: true }
);

const ContactUs = mongoose.model("ContactUs", ContactUsSchema);

module.exports = ContactUs;
