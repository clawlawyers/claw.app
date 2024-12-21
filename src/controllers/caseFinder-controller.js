const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");

const { FLASK_API_ENDPOINT } = process.env;

async function fetchScrapeApi(id) {
  const response = await fetch(`${FLASK_API_ENDPOINT}/scrape/case/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const parsedData = await response.json();
  const resp = JSON.parse(parsedData);

  return resp;
}

async function getCase(req, res) {
  try {
    const response = await fetchScrapeApi(req.params.id);
    return res.status(StatusCodes.OK).json(SuccessResponse(response));
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

module.exports = {
  getCase,
};
