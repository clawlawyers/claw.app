const { GptServices } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const {
  consumeTokenGpt,
  consumeTokenCaseSearch,
} = require("../services/gpt-service");

const { FLASK_API_ENDPOINT } = process.env;

async function fetchGptApi(body) {
  console.log(body);
  const response = await fetch(`${FLASK_API_ENDPOINT}/gpt/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log(response);

  const res = response.json();

  return res;
}

async function generateGptResponse(req, res) {
  try {
    const { prompt } = req.body;
    const gptApiResponse = await fetchGptApi({ prompt, context: "" });

    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        gptResponse: { message: gptApiResponse.gptResponse },
      })
    );
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function initGptUser(req, res) {
  try {
    const { _id, phoneNumber } = req.body.client;
    const newUser = await GptServices.createGptUser(
      phoneNumber,
      _id.toString()
    );
    return res.status(StatusCodes.CREATED).json(SuccessResponse(newUser));
  } catch (error) {
    console.log(error);
    res.status(error.statusCode).json(ErrorResponse({}, error));
  }
}

async function startSession(req, res) {
  try {
    const { _id } = req.body.client;
    const userId = _id.toString();
    const { prompt, model } = req.body;
    // Fetch Context
    const session = await GptServices.createSession(userId, prompt, model);

    return res.status(StatusCodes.OK).json(SuccessResponse(session));
  } catch (error) {
    console.log(error);
    res.status(error.statusCode).json(ErrorResponse({}, error));
  }
}

async function funPlan(req, res) {
  try {
    const { userId, newPlan } = req.body;
    console.log(newPlan);
    const recievedResponse = await GptServices.updateUserPlan(userId, newPlan);
    // const plans = await prisma.userPlan.findMany({
    //   where: {
    //     userId: userId,
    //   },
    // });
    // const plansData = await Promise.all(
    //   plans.map(async (plan) => {
    //     const Pdata = await prisma.plan.findUnique({
    //       where: { name: plan.planName },
    //     });

    //     return Pdata;
    //   })
    // );

    const Pdata = await prisma.plan.findUnique({
      where: { name: newPlan },
    });

    // console.log(plansData);
    let totalGptTokens = Pdata.gptToken;
    let totalCaseSearchTokens = Pdata.caseSearchToken;

    console.log(totalGptTokens, totalCaseSearchTokens);

    const updatedUser = await prisma.user.update({
      where: {
        mongoId: userId,
      },
      data: {
        totalGptTokens: {
          increment: totalGptTokens, // or any other value you want to increment by
        },
        totalCaseSearchTokens: {
          increment: totalCaseSearchTokens, // or any other value you want to increment by
        },
      },
    });

    console.log(updatedUser);
    return res.status(StatusCodes.OK).json(SuccessResponse(recievedResponse));
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function caseSearchOnCheck(req, res) {
  try {
    let { phoneNumber } = req.body;
    phoneNumber = phoneNumber.substring(3);
    const response = await GptServices.caseSearchOnCheck(phoneNumber);
    return res.status(StatusCodes.OK).json(SuccessResponse(response));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function caseSearchOn(req, res) {
  try {
    let { phoneNumber } = req.body;
    phoneNumber = phoneNumber.substring(3);
    const response = await GptServices.caseSearchOn(phoneNumber);
    return res.status(StatusCodes.OK).json(SuccessResponse(response));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function appendMessage(req, res) {
  try {
    const { prompt, sessionId } = req.body;

    const { modelName, user } = await GptServices.fetchSessionBySessionId(
      sessionId
    );
    if (!modelName)
      throw new AppError("Invalid sessionId", StatusCodes.BAD_REQUEST);

    // Fetch Context
    const context = await GptServices.fetchContext(sessionId);

    // Save User Prompt
    await GptServices.createMessage(sessionId, prompt, true, user.mongoId);

    // Make a call to gpt for generating response
    console.log("called by mode", modelName);
    const gptApiResponse = await fetchGptApi({ prompt, context });

    // Save Gpt Response
    const gptResponse = await GptServices.createMessage(
      sessionId,
      gptApiResponse.gptResponse,
      false
    );

    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ sessionId, gptResponse }));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function appendRegeneratedMessage(req, res) {
  try {
    const { prompt, sessionId } = req.body;

    const { modelName, user } = await GptServices.fetchSessionBySessionId(
      sessionId
    );
    if (!modelName)
      throw new AppError("Invalid sessionId", StatusCodes.BAD_REQUEST);

    // Fetch Context
    const context = await GptServices.fetchContextForRegenerate(sessionId);

    // Save User Prompt
    // await GptServices.createMessage(sessionId, prompt, true, user.mongoId);

    // Make a call to gpt for generating response
    console.log("called by mode", modelName);
    const gptApiResponse = await fetchGptApi({ prompt, context });

    // Save Gpt Response
    const gptResponse = await GptServices.RegenertaedMessage(
      sessionId,
      gptApiResponse.gptResponse,
      false
    );

    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ sessionId, gptResponse }));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function feedBack(req, res) {
  try {
    const { messageId, impression, feedbackType, feedbackMessage } = req.body;
    const userId = req.body.client._id;

    const message = await GptServices.appendFeedbackMessageByMessageId(
      messageId,
      impression,
      feedbackType,
      feedbackMessage,
      userId
    );
    return res.status(StatusCodes.OK).json(SuccessResponse(message));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function judgement(req, res) {
  try {
    const { sessionId } = req.body;

    // Fetch Context
    const context = await GptServices.fetchContext(sessionId);
    const fetchedJudgement = await fetchSupremeCourtRoomJudgement({
      context,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(fetchedJudgement));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function fetchSupremeCourtRoomJudgement(body) {
  console.log(body);
  const response = await fetch(`${FLASK_API_ENDPOINT}/gpt/judgement`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log(response);

  return response.json();
}

async function relevantAct(req, res) {
  try {
    const { sessionId } = req.body;

    // Fetch Context
    const context = await GptServices.fetchContext(sessionId);
    const fetchedRelevantAct = await fetchRelevantAct({
      context,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(fetchedRelevantAct));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function fetchRelevantAct(body) {
  console.log(body);
  const response = await fetch(`${FLASK_API_ENDPOINT}/gpt/reference`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log(response);

  return response.json();
}

async function fetchGptRelatedCases(context, courtName) {
  console.log(context);
  try {
    const response = await fetch(`${FLASK_API_ENDPOINT}/search/relatedCases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ context, courtName }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API response status:", response.status);
      console.error("API response body:", errorBody);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const parsed = await response.json();

    return parsed;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to make api request to gpt.claw");
  }
}

async function suggestQuestions(req, res) {
  try {
    const { context } = req.body;
    const Fetchedquestions = await Fetchquestions(context);
    return res.status(StatusCodes.OK).json(SuccessResponse(Fetchedquestions));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function Fetchquestions(context) {
  console.log(context);
  try {
    const response = await fetch(`${FLASK_API_ENDPOINT}/gpt/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API response status:", response.status);
      console.error("API response body:", errorBody);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const parsed = await response.json();

    return parsed;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to make api request to gpt.claw");
  }
}

async function getRelatedCases(req, res) {
  try {
    const { sessionId } = req.params;
    console.log(sessionId);
    const messagePair = await GptServices.fetchLastMessagePair(sessionId);
    const lastMessageId = messagePair[0].id;
    const context = messagePair.reduce(
      (acc, curr) => (acc = acc + " " + curr.text),
      ""
    );
    const { courtName } = req.body;

    const relatedCases = await fetchGptRelatedCases(context, courtName);

    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ ...relatedCases, messageId: lastMessageId }));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function getUserSessions(req, res) {
  try {
    const { model } = req.params;
    const { _id } = req.body.client;
    const userId = _id.toString();
    const sessions = await GptServices.fetchSessions(userId, model);

    return res.status(StatusCodes.OK).json(SuccessResponse(sessions));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function getSessionMessages(req, res) {
  try {
    const { sessionId } = req.params;
    const messages = await GptServices.fetchSessionMessages(sessionId);

    return res.status(StatusCodes.OK).json(SuccessResponse(messages));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function createGptModel(req, res) {
  try {
    const { name, version } = req.body;
    const response = await GptServices.createModel(name, parseFloat(version));
    return res.status(StatusCodes.OK).json(SuccessResponse(response));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}
async function createGptPlan(req, res) {
  try {
    const { name, session, token } = req.body;
    const response = await GptServices.createPlan(
      name,
      parseInt(session),
      parseInt(token)
    );
    return res.status(StatusCodes.OK).json(SuccessResponse(response));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function createReferralCode(req, res) {
  try {
    const { _id, firstName, lastName, collegeName } = req.body.client;
    const checkCodeAlreadyExist = async (rCode) => {
      await GptServices.CheckReferralCodeExist(rCode);
    };

    const rCode = () => {
      return firstName?.substr(0, 4) + Math.floor(1000 + Math.random() * 9000);
    };

    if (checkCodeAlreadyExist(rCode)) {
      const referralCode = await GptServices.createReferralCode(_id, rCode);
      return res.status(StatusCodes.OK).json(
        SuccessResponse({
          referralCode,
          redeemCount: 0,
          client: {
            firstName,
            lastName,
            collegeName,
          },
        })
      );
    }

    const referralCode = await GptServices.createReferralCode(_id, rCode);
    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        referralCode,
        redeemCount: 0,
        client: {
          firstName,
          lastName,
          collegeName,
        },
      })
    );
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function redeemReferralCode(req, res) {
  try {
    const { _id } = req.body.client;
    const { referralCode } = req.body;
    console.log(req.body);
    const rCode = () => {
      return referralCode;
    };
    // const existCode = await GptServices.CheckReferralCodeExist(rCode);
    const response = await GptServices.redeemReferralCode(referralCode, _id);
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ message: existCode ? true : false }));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function verifyReferralCode(req, res) {
  try {
    const { _id } = req.body.client;

    const { referralCode } = req.body;

    const response = await GptServices.verifyReferralCode(referralCode, _id);

    console.log(response);
    return res.status(StatusCodes.OK).json(SuccessResponse(response));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.messages));
  }
}
async function fetchAmbassadorDetails(req, res) {
  try {
    // console.log(req.body);
    const { _id, firstName, lastName, collegeName } = req.body.client;
    const response = await GptServices.fetchReferralDetails(_id);
    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        ...response,
        client: { firstName, lastName, collegeName },
      })
    );
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function fetchGptUser(req, res) {
  try {
    const { _id } = req.body.client;
    if (!_id)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          ErrorResponse({}, { message: "Missing jwt for user authorization" })
        );
    const gptUser = await GptServices.fetchGptUser(_id);

    // if (gptUser) {
    //   // Format the token values to one decimal place
    //   gptUser.token.used = parseFloat(gptUser.token.used.toFixed(1));
    //   // gptUser.token.total = parseFloat(gptUser.token.total.toFixed(1));
    // }

    const gtpUserGuy = await prisma.user.findFirst({
      where: {
        mongoId: _id,
      },
    });

    if (gtpUserGuy.isambassadorBenifined === false) {
      const createAt = new Date();
      const expiresAt = new Date(createAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      await GptServices.updateIsAmbassadorBenifined(_id, true);
      await GptServices.updateUserPlan(
        _id,
        "FREE_M",
        "ambassador",
        "",
        createAt,
        null,
        "",
        expiresAt,
        0
      );
    }

    return res.status(StatusCodes.OK).json(SuccessResponse(gptUser));
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function fetchGptCases(folderId, caseId) {
  console.log(folderId, caseId);
  try {
    const response = await fetch(
      `${FLASK_API_ENDPOINT}/scrape/case/view_document`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folder_id: folderId, case_id: caseId }),
      }
    );

    const parsed = await response.json();

    return parsed;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Failed to make api request to gpt.claw",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

function formatCaseData(data) {
  if (
    !data ||
    typeof data !== "object" ||
    !data.content ||
    typeof data.content !== "string"
  ) {
    throw new Error("Invalid data format");
  }

  // Unescape the content string
  const unescapedContent = data.content
    .replace(/\\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/(\\t)+/g, (match) => "\t".repeat(match.length / 2))
    .replace(/\\f/g, "\f")
    .replace(/\n(?!\s|And|&)/g, " ")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\n\s{4,}/g, " ")
    .replace(/\n\s{4,}(?=\w{5,}\n|And\n|&\n)/g, " ")
    .replace(/\s+(and|&)\s+/g, " $1 ")
    .replace(/\n\s*\/\s*/g, "/")
    .replace(/\n{4,}/g, "\n")
    .replace(/(\d+)\)\s*,\s*/g, "$1),\n")
    .replace(/([^.)\n])(\\n)/g, "$1 ");

  // Split the unescaped content into sections
  const sections = unescapedContent.split("\n\n\n");
  if (sections.length < 1) {
    throw new Error("Invalid data format");
  }

  const formattedData = {
    court: sections[0]?.trim() || "",
    details: sections[1]?.trim() || "",
    author: sections[2]?.trim() || "",
    bench: sections[3]?.trim() || "",
    caseNumber: sections[4]?.trim() || "",
    judge: sections[5]?.trim() || "",
    advocates: sections[6]?.trim() || "",
    summary: sections.slice(7).join("\n\n").trim(),
  };

  return formattedData;
}

async function fetchCaseDetails(req, res) {
  try {
    const { _id } = req.body.client;
    const { folderId, caseId } = req.params;
    const data = await fetchGptCases(folderId, caseId);
    // const updatedTokenVault = await consumeTokenCaseSearch(_id, 1);
    // console.log(updatedTokenVault);
    const respo = formatCaseData(data);

    // Assuming SuccessResponse and ErrorResponse are functions that return the appropriate response formats
    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        fetchedData: respo,
        // ...updatedTokenVault
      })
    );
  } catch (error) {
    console.log(error);
    // Assuming ErrorResponse is a function that returns the appropriate error response format
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function fetchGptCaseQuery(body) {
  try {
    const response = await fetch(`${FLASK_API_ENDPOINT}/search/case`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const parsed = await response.json();
    return parsed;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Failed to make api request to gpt.claw",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function queryCase(req, res) {
  try {
    const { _id } = req.body.client;
    const {
      startDate = "18-sep-01",
      endDate = "19-sep-20",
      query = "",
      courtName = "",
    } = req.body;

    if (!query) throw new AppError("Invalid query", StatusCodes.BAD_REQUEST);
    // const updatedTokenVault = await consumeTokenCaseSearch(_id, 1);
    // console.log(updatedTokenVault);
    const response = await fetchGptCaseQuery({
      startDate,
      endDate,
      query,
      courtName,
    });
    // console.log(updatedTokenVault);
    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        ...response,
        // ...updatedTokenVault
      })
    );
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

//scrape data
async function fetchCaseSummery(folderId, caseId, query) {
  try {
    console.log(folderId, caseId, query);
    const response = await fetch(
      `${FLASK_API_ENDPOINT}/overview/case/view_overview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folder_id: folderId,
          case_id: caseId,
          search_query: query,
        }),
      }
    );
    const parsed = await response.json();
    return parsed;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Failed to make api request to gpt.claw",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

//get summery details
async function getSummaryDetails(req, res) {
  try {
    const { folderId, caseId, query } = req.body;
    const data = await fetchCaseSummery(folderId, caseId, query);

    return res.json(data);
  } catch (error) {
    console.error("Error in getSummaryDetails:", error);
    return res.status(500).json({ error: error.message });
  }
}

//scrape date for legalgpt
async function fetchlegalgptCaseSummery(folderId, caseId) {
  try {
    console.log(folderId, caseId);
    const response = await fetch(
      `${FLASK_API_ENDPOINT}/overview/case/view_overview_gpt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folder_id: folderId,
          case_id: caseId,
        }),
      }
    );
    const parsed = await response.json();

    return parsed;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Failed to make api request to gpt.claw",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

//get legalgpt summery  details

async function getLegalgptSummaryDetails(req, res) {
  try {
    const { folderId, caseId } = req.body;
    let data = await fetchlegalgptCaseSummery(folderId, caseId);

    return res.json(data);
  } catch (error) {
    console.error("Error in getSummaryDetails:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function deleteUserSessions(req, res) {
  try {
    const { _id } = req.body.client;
    const { model } = req.params;
    await GptServices.deleteSessions(_id, model);
    return res.status(StatusCodes.OK).json(SuccessResponse());
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

module.exports = {
  startSession,
  getUserSessions,
  appendMessage,
  getSessionMessages,
  generateGptResponse,
  initGptUser,
  createGptModel,
  createGptPlan,
  createReferralCode,
  redeemReferralCode,
  fetchGptUser,
  fetchAmbassadorDetails,
  fetchCaseDetails,
  queryCase,
  getRelatedCases,
  deleteUserSessions,
  fetchCaseSummery,
  getSummaryDetails,
  fetchlegalgptCaseSummery,
  getLegalgptSummaryDetails,
  caseSearchOn,
  caseSearchOnCheck,
  funPlan,
  judgement,
  relevantAct,
  verifyReferralCode,
  suggestQuestions,
  appendRegeneratedMessage,
  feedBack,
};
