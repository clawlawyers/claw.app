const { StatusCodes } = require("http-status-codes");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { AL_DRAFTER_API } = process.env;
const FormData = require("form-data");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function uploadDocument(req, res) {
  try {
    var file = req.file;
    const doc_id = req.body.doc_id;
    console.log(doc_id);
    console.log("filedata1234");

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log(file);

    const intval = Math.floor(Math.random() * 10000) + 1;
    file.originalname = `${doc_id}` + ".docx";
    console.log(file);

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

async function getDocumentPromptRequirements(req, res) {
  try {
    const { doc_id } = req.body;
    const fetchedData = await fetchGetDocumentPromptRequirements({ doc_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchGetDocumentPromptRequirements({ doc_id }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${AL_DRAFTER_API}/get_document_prompt_requirements`,
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
  console.log("hi");
  try {
    const { doc_id } = req.body;
    console.log(doc_id);
    const fetchedData = await fetchBreakout({ doc_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    // console.log(error);
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
    console.log(response);
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

async function apiGetTypes(req, res) {
  try {
    const fetchedData = await fetchTypes();
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchTypes() {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/api/get_types`);
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

async function apiAddClause(req, res) {
  try {
    const { doc_id, clause_query } = req.body;
    const fetchedData = await fetchAddClause({ doc_id, clause_query });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchAddClause({ doc_id, clause_query }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/api_add_clause`, {
      method: "POST",
      body: JSON.stringify({ doc_id, clause_query }),
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

async function apiGetModifiedDoc(req, res) {
  try {
    const { doc_id } = req.body;
    const fetchedData = await fetchGetModifiedDoc({ doc_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error, message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchGetModifiedDoc({ doc_id }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${AL_DRAFTER_API}/api/get_modified_doc`, {
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
async function getpdf(req, res) {
  const { document } = req.body;
  console.log(document);
  try {
    // Define file path to save PDF
    // const filePath = path.join(__dirname, "Rent_Agreement.pdf");
    // const response = await axios.get(
    //   "https://res.cloudinary.com/dumjofgxz/image/upload/v1725968109/gptclaw_l8krlt.png",
    //   {
    //     responseType: "arraybuffer",
    //   }
    // );
    // console.log(response.data);

    // const imageBuffer = Buffer.from(response.data, "binary");

    console.log("imagepath");
    const regularFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Regular.ttf"
    );
    const boldFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Bold.ttf"
    );
    console.log("hjkvh");
    const doc = new PDFDocument();
    doc.registerFont("NotoSans", regularFontPath);
    doc.registerFont("NotoSans-Bold", boldFontPath);

    doc.font("NotoSans");
    console.log("hg");

    // // Pipe the document to a file or to response
    // doc.pipe(fs.createWriteStream(filePath));

    // // Pipe the document to the response (for direct download)
    // doc.pipe(res);
    // doc.opacity(0.5);
    // doc.image(imageBuffer, {
    //   fit: [600, 600],
    //   opacity: 0.1,
    // align: "center",
    //   valign: "center",
    // });
    // doc.opacity(1);

    // Add content to the PDF
    // doc.fontSize(20).text("RENT AGREEMENT", { align: "center" });

    // doc.moveDown();
    const textLines = document.split("\\n");
    // const textLines = ["asdadasda"];
    console.log(textLines);
    // cosnole.log("hi");
    for (var i = 0; i < textLines.length; i++) {
      doc.text(textLines[i]);
      doc.moveDown();
    }

    // textLines.map((line, i) => {
    //   cosnole.log(line);

    //   doc.text(line);
    //   doc.moveDown(); // Adds space between lines
    // });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      console.log("hi");

      const pdfBuffer = Buffer.concat(chunks);

      // Load the generated PDF to add watermark on every page
      const { PDFDocument: LibPDFDocument, rgb } = require("pdf-lib");
      const pdfDoc = await LibPDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const imagePath = path.join(__dirname, "..", "fonts", "gptclaw.png"); // Update with the correct image path
      console.log("imagepath");
      const imageBuffer = fs.readFileSync(imagePath);
      const watermarkImage = await pdfDoc.embedPng(imageBuffer);

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const imageWidth = 400; // Adjust size as needed
        const imageHeight =
          (imageWidth / watermarkImage.width) * watermarkImage.height; // Maintain aspect ratio
        const xPosition = (width - imageWidth) / 2;
        const yPosition = (height - imageHeight) / 2;

        page.drawImage(watermarkImage, {
          x: xPosition,
          y: yPosition,
          width: imageWidth,
          height: imageHeight,
          opacity: 0.3, // Adjust opacity as needed
        });
      });
      console.log("hi");

      // Save the final PDF with watermark
      const watermarkedPdfBytes = await pdfDoc.save();
      res.setHeader("Content-disposition", `attachment; filename="new.pdf"`);
      res.setHeader("Content-type", "application/pdf");
      res.send(Buffer.from(watermarkedPdfBytes));
    });

    doc.end();

    // Set the response headers for download
  } catch (e) {}
}
// async function getpdf(req, res) {
//   const { document } = req.body;
//   const doc = new PDFDocument({
//     size: "A4",
//     layout: "portrait",
//   });

//   // Define file path to save PDF
//   const filePath = path.join(__dirname, "Rent_Agreement.pdf");
//   const response = await axios.get(
//     "https://res.cloudinary.com/dumjofgxz/image/upload/v1725968109/gptclaw_l8krlt.png",
//     {
//       responseType: "arraybuffer",
//     }
//   );
//   const imageBuffer = Buffer.from(response.data, "binary");

//   // Pipe the document to a file or to response
//   doc.pipe(fs.createWriteStream(filePath));

//   // Pipe the document to the response (for direct download)
//   doc.pipe(res);
//   // doc.opacity(0.5);
//   // doc.image(imageBuffer, {
//   //   fit: [600, 600],
//   //   opacity: 0.1,
//   //   align: "center",
//   //   valign: "center",
//   // });
//   // doc.opacity(1);

//   // Add content to the PDF
//   // doc.fontSize(20).text("RENT AGREEMENT", { align: "center" });

//   // doc.moveDown();
//   const textLines = document.split("\\n");
//   const pageWidth = doc.page.width;
//   const pageHeight = doc.page.height;
//   const img = doc.openImage(imageBuffer);
//   const imgWidth = img.width;
//   const imgHeight = img.height;

//   // Calculate position for the image to be centered
//   const x = (pageWidth - imgWidth) / 2;
//   const y = (pageHeight - imgHeight) / 2;
//   textLines.forEach((line, i) => {
//     if (i % 35 == 0) {
//       doc.opacity(0.5);
//       doc.image(imageBuffer, x + 200, y, {
//         scale: 0.5,
//         align: "center",
//         valign: "center",
//       });
//       doc.opacity(1);
//     }
//     doc.text(line, {
//       width: 450,
//       align: "left",
//     });
//     doc.moveDown(0.5); // Adds space between lines
//   });

//   doc.end();

//   // Set the response headers for download
//   res.setHeader(
//     "Content-disposition",
//     "attachment; filename=Rent_Agreement.pdf"
//   );
//   res.setHeader("Content-type", "application/pdf");
// }

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
  apiGetTypes,
  apiAddClause,
  apiGetModifiedDoc,
  getpdf,
  getDocumentPromptRequirements,
};
