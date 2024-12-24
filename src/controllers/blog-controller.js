const { BlogService } = require("../services");
const { StatusCodes } = require("http-status-codes");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function getAllBlogs(req, res) {
  try {
    let { limit, page } = req.query;
    limit = limit ? parseInt(limit) : 20;
    page = page ? parseInt(page) : 1;
    const blogs = await BlogService.getAllBlogs(limit, page);
    return res.status(StatusCodes.OK).json(SuccessResponse(blogs));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function getBlogByName(req, res) {
  try {
    const { blogName } = req.params;
    const response = await BlogService.getBlogByName(blogName);
    return res.status(StatusCodes.OK).json(SuccessResponse(response));
  } catch (error) {
    return res
      .status(error.StatusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function getLinkingBlogs(req, res) {
  try {
    const { excludedBlogName } = req.params;
    const blogs = await BlogService.getLinkingBlogs(excludedBlogName);
    return res.status(StatusCodes.OK).json(SuccessResponse(blogs));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function createBlogs(req, res) {
  try {
    const { heading, subHeading, content, html, mainImg } = req.body;
    const newBlog = await BlogService.createBlog({
      heading,
      subHeading,
      content,
      html,
      mainImg,
    });
    return res.status(StatusCodes.CREATED).json(SuccessResponse(newBlog));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

module.exports = {
  getAllBlogs,
  getLinkingBlogs,
  createBlogs,
  getBlogByName,
};
