const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true, unique: true },
    mainImg: { type: String },
    subHeading: { type: String, required: true, trim: true },
    content: { type: Array, default: [] },
    html: { type: String, trim: true },
  },
  { timestamps: true }
);

const Blog = new mongoose.model("Blog", blogSchema);

module.exports = Blog;
