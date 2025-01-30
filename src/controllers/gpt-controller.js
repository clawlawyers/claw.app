const { GptServices } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const path = require("path");
const AppError = require("../utils/errors/app-error");
const {
  consumeTokenGpt,
  consumeTokenCaseSearch,
} = require("../services/gpt-service");
const {
  sendConfirmationEmailForAmbasForFreePlan,
} = require("../utils/common/sendEmail");
const FormData = require("form-data");
const prisma = require("../config/prisma-client");

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

  const resp = JSON.parse(res);

  return resp;
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

async function appendMessageByScocket(req, res) {
  const { text, isDocument, contextId, isUser, sessionId } = req.body;
  try {
    const newMessage = await GptServices.createSocketMessage(
      text,
      isDocument,
      contextId, // Can be null if no context
      isUser,
      sessionId
    );

    return res.status(StatusCodes.OK).json(SuccessResponse(newMessage));
  } catch (error) {
    console.log(error);
    res.status(error.statusCode).json(ErrorResponse({}, error.message));
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

  const res = await response.json();

  const resp = JSON.parse(res);

  return resp;
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

  const res = await response.json();

  const resp = JSON.parse(res);

  return resp;
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

    const resp = JSON.parse(parsed);

    return resp;
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

    const resp = JSON.parse(parsed);

    return resp;
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
      const username = req?.body?.client?.firstName;
      const email = req?.body?.client?.email;

      await sendConfirmationEmailForAmbasForFreePlan(email, username);
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

    const resp = JSON.parse(parsed);

    return resp;
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

    const resp = JSON.parse(parsed);

    return resp;
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

    const resp = await JSON.parse(parsed);
    return resp;
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

    const res = JSON.parse(parsed);

    return res;
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

async function cancelSubscription(req, res) {
  try {
    const { _id } = req.body.client;
    const { planName } = req.body;
    await GptServices.cancelSubscription(_id, planName);
    return res.status(StatusCodes.OK).json(SuccessResponse());
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function readAloud(req, res) {
  const { input_text } = req.body;

  if (!input_text) {
    return res.status(400).send({ error: "input_text is required" });
  }

  try {
    // Fetch the MP3 file from the read_aloud API
    const filePath = await fetchReadAloud({ input_text });

    // Send the MP3 file as response
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'attachment; filename="output.mp3"',
    });
    res.sendFile(filePath, (err) => {
      // After sending the file, delete it from the server
      if (err) {
        console.error("Error sending file:", err);
      }
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully");
        }
      });
    });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function getPurchaseHistory(req, res) {
  try {
    const { _id } = req.body.client;
    const history = await GptServices.getPurchaseHistory(_id);
    return res.status(StatusCodes.OK).json(SuccessResponse({ history }));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function fetchReadAloud({ input_text }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;

    // Send the POST request to the read_aloud API
    const response = await fetch("http://20.193.128.165/api/read_aloud", {
      method: "POST",
      body: JSON.stringify({ input_text }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response is not OK
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    // Handle the MP3 file response (binary data)
    const mp3Data = await response.arrayBuffer();
    const filePath = path.join(__dirname, "output.mp3");

    // Save the MP3 file temporarily to the server
    fs.writeFileSync(filePath, Buffer.from(mp3Data));

    // Return the path to the file for sending in response
    return filePath;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function upload(req, res) {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const { language } = req.body;
    const formData = new FormData();

    console.log(files);

    // Append each file to the form-data with its buffer, filename, and content type
    for (const key of Object.keys(files)) {
      const file = files[key][0];
      console.log(file);
      formData.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }

    console.log(formData);

    formData.append("language", language);

    const fetchUploaded = await fetchUpload(formData);

    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchUploaded }));
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

async function fetchUpload(formData) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${FLASK_API_ENDPOINT}/upload`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const parsed = await response.json();

    const res = JSON.parse(parsed);

    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function translate(req, res) {
  try {
    const { context, language } = req.body;
    const translatedText = await GptServices.Fetchingtranslate(
      context,
      language
    );
    return res.status(StatusCodes.OK).json(SuccessResponse({ translatedText }));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

// Controller to generate invoice PDF
async function generateInvoice(req, res) {
  try {
    // Log the incoming request body to understand the structure
    console.log("Request Body:", req.body);

    // Extract userId from req.body.client._id and log the extracted userId
    const { _id } = req.body.client; // userId is in the client object
    console.log("Extracted userId:", _id);

    // Extract planName from the request body and log it
    const { planName } = req.body;
    console.log("Extracted planName:", planName);

    // Call service to generate the invoice PDF
    console.log("Generating PDF for userId:", _id, "and planName:", planName);
    const pdfBuffer = await GptServices.generateInvoicePDF(_id, planName);

    // Check if the PDF buffer is empty or null
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error("Generated PDF buffer is empty.");
      return res
        .status(500)
        .json({ error: "Failed to generate PDF, empty buffer." });
    }

    // Log the buffer size to ensure it's a valid PDF
    console.log("Generated PDF buffer size:", pdfBuffer.length);

    // Set the response headers and send the PDF buffer as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="invoice.pdf"');

    // Send the PDF as the response
    console.log("Sending the generated PDF...");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error while generating invoice:", error); // Enhanced logging
    res.status(500).json({
      error: "An error occurred while generating the invoice",
      details: error.message,
    });
  }
}

async function storeUsedTime(req, res) {
  try {
    const userId = req.body.client._id;

    await GptServices.storeUsedTimeService(userId);
    return res
      .status(StatusCodes.OK)
      .json({ message: "Time stored successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

module.exports = {
  startSession,
  appendMessageByScocket,
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
  cancelSubscription,
  readAloud,
  getPurchaseHistory,
  upload,
  translate,
  generateInvoice,
  storeUsedTime,
};
