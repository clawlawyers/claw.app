const { BlogRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

const blogRepository = new BlogRepository();

async function getAllBlogs(limit, page) {
  try {
    const response = await blogRepository.getPaginatedBlogs(limit, page);
    return response;
  } catch (error) {
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getBlogByName(blogName) {
  try {
    console.log(blogName);
    return await blogRepository.getBlogByName(blogName);
  } catch (error) {
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getLinkingBlogs(excludedBlogName) {
  try {
    const response = await blogRepository.getLinkingBlogs(excludedBlogName);
    return response;
  } catch (error) {
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function createBlog(data) {
  try {
    const response = await blogRepository.create(data);
    return response;
  } catch (error) {
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  getAllBlogs,
  getLinkingBlogs,
  createBlog,
  getBlogByName,
};
