const { StatusCodes } = require("http-status-codes");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { AL_DRAFTER_API } = process.env;
const FormData = require("form-data");

async function uploadDocument(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fetchedData = await FetchupdateDocument({ file: file });

    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchupdateDocument({ file }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;

    console.log(AL_DRAFTER_API);

    console.log(file);

    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await fetch(`${AL_DRAFTER_API}/upload_document`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(), // Ensure correct headers are set
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    // console.error("Error in getOverview:");
    throw error;
  }
}

async function createDocument(req, res) {
  try {
    const fetchedData = await FetchcreateDocument();
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse); 
  }
}

async function FetchcreateDocument() {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/create_document`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getDocumentFromPrompt(req, res) {
  try {
    const { doc_id, prompt } = req.body;
    const fetchedData = await FetchgetDocumentFromPrompt({ doc_id, prompt });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchgetDocumentFromPrompt({ doc_id, prompt }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/get_document_from_prompt`, {
      method: "POST",
      body: JSON.stringify({ doc_id, prompt }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function uploadPrerequisites(req, res) {
  try {
    const { data } = req.body;

    const fetchedData = await fetchUploadPrerequisites(data);
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchUploadPrerequisites(data) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/upload_prerequisites`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function uploadOptionalParameters(req, res) {
  try {
    const { data } = req.body;
    const fetchedData = await fetchUploadOptionalParameters(data);
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchUploadOptionalParameters(data) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${AL_DRAFTER_API}/upload_optional_parameters`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getRequirements(req, res) {
  try {
    const { doc_id, type } = req.body;
    const fetchedData = await fetchGetRequirements({ doc_id, type });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchGetRequirements({ doc_id, type }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/get_requirements`, {
      method: "POST",
      body: JSON.stringify({ doc_id, type }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function generateDocument(req, res) {
  try {
    const { doc_id } = req.body;
    const fetchedData = await fetchGenerateDocument({ doc_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchGenerateDocument({ doc_id }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/generate_document`, {
      method: "POST",
      body: JSON.stringify({ doc_id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function generateDocumentForType(req, res) {
  try {
    const { doc_id } = req.body;
    const fetchedData = await fetchGenerateDocumentForType({ doc_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchGenerateDocumentForType({ doc_id }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${AL_DRAFTER_API}/generate_document_for_type`,
      {
        method: "POST",
        body: JSON.stringify({ doc_id }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function breakout(req, res) {
  try {
    const { doc_id } = req.body;
    const fetchedData = await fetchBreakout({ doc_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchBreakout({ doc_id }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/breakout`, {
      method: "POST",
      body: JSON.stringify({ doc_id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function generateDatabase(req, res) {
  try {
    const { doc_id } = req.body;

    console.log(doc_id);
    const fetchedData = await fetchGenerateDatabase({ doc_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchGenerateDatabase({ doc_id }) {
  try {
    console.log(doc_id);
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/db_generate`, {
      method: "POST",
      body: JSON.stringify({ doc_id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function askQuestion(req, res) {
  try {
    const { doc_id, query } = req.body;
    const fetchedData = await fetchAskQuestion({ doc_id, query });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchAskQuestion({ doc_id, query }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/ask_question`, {
      method: "POST",
      body: JSON.stringify({ doc_id, query }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function summarize(req, res) {
  try {
    const { doc_id } = req.body;
    const fetchedData = await fetchSummarize({ doc_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchSummarize({ doc_id }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/summarize`, {
      method: "POST",
      body: JSON.stringify({ doc_id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function editDocument(req, res) {
  try {
    const { doc_id, edit_query } = req.body;
    const fetchedData = await fetchEditDocument({
      doc_id,
      edit_query,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchEditDocument({ doc_id, edit_query }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/edit_document`, {
      method: "POST",
      body: JSON.stringify({ doc_id, edit_query }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function summaryHeadings(req, res) {
  try {
    const { doc_id, headpoint_to_find } = req.body;
    const fetchedData = await fetchSummaryHeadings({
      doc_id,
      headpoint_to_find,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchSummaryHeadings({ doc_id, headpoint_to_find }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/summary_headings`, {
      method: "POST",
      body: JSON.stringify({ doc_id, headpoint_to_find }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function favor(req, res) {
  try {
    const { doc_id, headpoint_to_find } = req.body;
    const fetchedData = await fetchFavor({ doc_id, headpoint_to_find });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchFavor({ doc_id, headpoint_to_find }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/favor`, {
      method: "POST",
      body: JSON.stringify({ doc_id, headpoint_to_find }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function neutralize(req, res) {
  try {
    const { doc_id, headpoint_to_find } = req.body;
    const fetchedData = await fetchNeutralize({ doc_id, headpoint_to_find });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchNeutralize({ doc_id, headpoint_to_find }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/neutralize`, {
      method: "POST",
      body: JSON.stringify({ doc_id, headpoint_to_find }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function counterFavor(req, res) {
  try {
    const { doc_id, headpoint_to_find } = req.body;
    const fetchedData = await fetchCounterFavor({ doc_id, headpoint_to_find });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchCounterFavor({ doc_id, headpoint_to_find }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/counter_favor`, {
      method: "POST",
      body: JSON.stringify({ doc_id, headpoint_to_find }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  uploadDocument,
  createDocument,
  getDocumentFromPrompt,
  uploadPrerequisites,
  uploadOptionalParameters,
  getRequirements,
  generateDocument,
  breakout,
  askQuestion,
  summarize,
  editDocument,
  generateDatabase,
  summaryHeadings,
  favor,
  neutralize,
  counterFavor,
  generateDocumentForType,
};
