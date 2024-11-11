const mongoose = require("mongoose");

const adiraAdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
});

const AdiraAdmin = mongoose.model("AdiraAdmin", adiraAdminSchema);

module.exports = AdiraAdmin;
