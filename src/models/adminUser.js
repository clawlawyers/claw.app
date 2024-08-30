const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
});

const AdminUser = mongoose.model("AdminUser", adminUserSchema);

module.exports = AdminUser;
