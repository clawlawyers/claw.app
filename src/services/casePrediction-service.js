const CASEPREDICTION_ENDPOINT = process.env.CASEPREDICTION_ENDPOINT;

async function getUserId() {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${CASEPREDICTION_ENDPOINT}/user_id`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(` message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching user");
  }
}

async function getCaseDetails(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/case_details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching case details");
  }
}

async function getEvidenceDetails(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/evidence_details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching evidence details");
  }
}

async function getDocumentDetails({ file }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;

    console.log(file);

    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/case_document`,
      {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(), // Ensure correct headers are set
      }
    );

    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    console.log(responseData);
    console.log("responseData");
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching document details");
  }
}

async function getEvidenceDocumentDetails({ file, type }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;

    console.log(file);

    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    formData.append("type", type);

    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/evidence_document`,
      {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(), // Ensure correct headers are set
      }
    );

    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    console.log(responseData);
    console.log("responseData");
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching Evidence document details");
  }
}

async function getWitnessDetails(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/witness_details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching witness details");
  }
}

async function getEvidenceAnalysis(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/evidence_analysis`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching evidence analysis");
  }
}

async function getProceduralCompliance(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/procedural_compliance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching procedural compliance");
  }
}

async function getLegalFactors(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/legal_factors`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching legal factors");
  }
}

async function getCost(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${CASEPREDICTION_ENDPOINT}/api/cost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching cost");
  }
}

async function getRecommendation(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/recommendation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching recommendation");
  }
}

async function getDbGenerate(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${CASEPREDICTION_ENDPOINT}/api/db_generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching db generate");
  }
}

async function getAskQuery(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${CASEPREDICTION_ENDPOINT}/api/ask_query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching ask query");
  }
}

async function getWinProbability(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/win_probability`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching win probability");
  }
}

async function getOverallScore(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `${CASEPREDICTION_ENDPOINT}/api/overall_score`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching overall score");
  }
}

async function getEnd(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${CASEPREDICTION_ENDPOINT}/api/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching end");
  }
}

module.exports = {
  getUserId,
  getCaseDetails,
  getEvidenceDetails,
  getDocumentDetails,
  getEvidenceDocumentDetails,
  getWitnessDetails,
  getEvidenceAnalysis,
  getProceduralCompliance,
  getLegalFactors,
  getCost,
  getRecommendation,
  getDbGenerate,
  getAskQuery,
  getWinProbability,
  getOverallScore,
  getEnd,
};
