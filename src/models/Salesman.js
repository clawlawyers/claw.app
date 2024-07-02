// server/models/Salesman.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SalesmanSchema = new Schema({
  name: String,
  referralCode: String,
  location: String,
  enrolledUsers: [{ type: Schema.Types.ObjectId, ref: "EnrolledUser" }],
});

module.exports = mongoose.model("Salesman", SalesmanSchema);
