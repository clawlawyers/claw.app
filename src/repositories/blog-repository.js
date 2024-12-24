const CrudRepository = require("./crud-repository");
const { Blog } = require("../models");
const AppError = require("../utils/errors/app-error");

class BlogRepository extends CrudRepository {
  constructor() {
    super(Blog);
  }

  async getBlogByName(blogName) {
    try {
      return await this.model.find({ heading: blogName });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getLinkingBlogs(excludedBlogName) {
    try {
      const response = await this.model
        .find({ heading: { $ne: excludedBlogName } })
        .select("-content")
        .limit(5);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPaginatedBlogs(limit, page) {
    try {
      const response = await this.model
        .find({})
        .select("heading subHeading createdAt mainImg")
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = BlogRepository;
