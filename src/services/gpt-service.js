// const { isFunctionMessage } = require("openai/lib/chatCompletionUtils.mjs");
const prisma = require("../config/prisma-client");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { FLASK_API_ENDPOINT } = process.env;
const PDFDocument = require("pdfkit");
const User = require("../models/user");
const Order = require("../models/order");
const Client = require("../models/client");
const { ClientService } = require(".");
const { ClientRepository } = require("../repositories");

const clientRepository = new ClientRepository();

async function fetchContext(sessionId) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        text: true,
      },
      take: 2,
    });
    let context = "";
    messages.forEach(({ text }) => {
      context += `${text}\n`;
    });

    console.log("context: " + context);

    console.log("context ended");

    return context;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while generating conversation context",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function fetchContextForRegenerate(sessionId) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        text: true,
      },
      take: 4, // Fetch the top 4 messages
    });

    console.log(messages);

    // Get the top 3 messages
    const topMessages = messages.slice(0, 3); // Get the first three elements.
    const splitMessages = messages.slice(2, 4); // Get elements at index 2 and 3 from the original messages array.

    console.log(splitMessages);

    // // Include the 4th message separately if it exists
    // const fourthMessage = messages[3] ? messages[3].text : "";

    // console.log(fourthMessage);

    let context = "";
    splitMessages.forEach(({ text }) => {
      context += `${text}\n`;
    });

    // // Add the 4th message to context if it exists
    // if (fourthMessage) {
    //   context += `${fourthMessage}\n`;
    // }

    console.log("context: " + context);
    console.log("context ended");

    return context;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while generating conversation context",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function createGptUser(phoneNumber, mongoId) {
  try {
    const newUser = await prisma.user.create({
      data: {
        phoneNumber,
        mongoId,
      },
    });

    const plan = await getUserPlan(mongoId); // it can be open
    console.log(plan.length);
    console.log(new Date());

    // This free plan only for some occasionally

    if (plan.length === 0) {
      console.log("user do not have any plan. plan will be creating");

      const createAt = new Date();
      // const expiresAt = new Date(createAt.getTime() + 30 * 24 * 60 * 60 * 1000);

      await updateUserAdiraPlan(
        mongoId,
        "FREE",
        "15 MINUTES TRIAL",
        "",
        createAt,
        null,
        "",
        null,
        0
      );

      console.log("plan created");
    }

    return newUser;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while creating new user",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function createGptUserForCompain(
  phoneNumber,
  mongoId,
  planName,
  razorpay_subscription_id,
  currencyType
) {
  try {
    const newUser = await prisma.user.create({
      data: {
        phoneNumber,
        mongoId,
      },
    });

    const plan = await getUserPlan(mongoId); // it can be open
    console.log(plan.length);
    console.log(new Date());

    // This free plan only for some occasionally

    if (plan.length === 0) {
      console.log("user do not have any plan. plan will be creating");

      const createAt = new Date();
      const expiresAt = new Date(createAt.getTime() + 30 * 24 * 60 * 60 * 1000);

      await updateUserAdiraPlan(
        mongoId,
        planName,
        razorpay_subscription_id,
        "compane",
        createAt,
        null,
        "",
        expiresAt,
        99,
        currencyType
      );

      console.log("plan created");
    }

    return newUser;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while creating new user",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function incrementNumberOfSessions(mongoId, count = 1) {
  try {
    console.log("Incrementing number of sessions by", count);
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: {
          mongoId,
        },
        data: {
          numberOfSessions: {
            increment: count,
          },
        },
      });

      console.log("Updated user:", user);
      return user;
    });

    return {
      numberOfSessions: updatedUser.numberOfSessions,
      mongoId: updatedUser.mongoId,
      StateLocation: updatedUser.StateLocation,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Error while incrementing number of sessions");
  }
}

async function createModel(name, version) {
  try {
    const newModel = await prisma.model.create({
      data: {
        name,
        version,
      },
    });
    return newModel;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while creating new model",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function createSession(userId, initialPrompt, modelName) {
  try {
    const newSession = await prisma.session.create({
      data: {
        userId,
        name: initialPrompt,
        modelName,
      },
    });
    return newSession;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while creating new sesssion",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function createPlan(name, session, token) {
  try {
    const newPlan = await prisma.plan.create({
      data: {
        name,
        session,
        token,
      },
    });

    return newPlan;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while creating new plan",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

//case search token used

async function consumeTokenCaseSearch(mongoId, count = 1) {
  try {
    console.log("count is ", count);
    const sender = await prisma.$transaction(async (tx) => {
      const sender = await tx.user.update({
        where: {
          mongoId,
        },
        data: {
          tokenUsed: {
            increment: count,
          },
          caseSearchTokenUsed: {
            increment: count,
          },
        },
        include: {
          plan: { select: { token: true } },
        },
      });

      console.log(sender);

      if (sender.caseSearchTokenUsed > sender.totalCaseSearchTokens)
        throw new Error(
          `User does not have enough tokens, user - ${mongoId}, token to be used - ${count}`
        );
      return sender;
    });
    return {
      token: {
        used: {
          gptTokenUsed: sender.gptTokenUsed,
          caseSearchTokenUsed: sender.caseSearchTokenUsed,
        },
        total: {
          totalGptTokens: sender.totalGptTokens,
          totalCaseSearchTokens: sender.totalCaseSearchTokens,
        },
      },
    };
  } catch (error) {
    console.log(error);
    throw new Error("Error while consuming token");
  }
}

//gpt token used
async function consumeTokenGpt(mongoId, count = 1) {
  try {
    console.log("count is ", count);
    const sender = await prisma.$transaction(async (tx) => {
      const sender = await tx.user.update({
        where: {
          mongoId,
        },
        data: {
          tokenUsed: {
            increment: count,
          },
          gptTokenUsed: {
            increment: count,
          },
        },
        include: {
          plan: { select: { token: true } },
        },
      });

      console.log(sender);

      if (sender.gptTokenUsed > sender.totalGptTokens)
        throw new Error(
          `User does not have enough tokens, user - ${mongoId}, token to be used - ${count}`
        );
      return sender;
    });
    return {
      token: {
        used: {
          gptTokenUsed: sender.gptTokenUsed,
          caseSearchTokenUsed: sender.caseSearchTokenUsed,
        },
        total: {
          totalGptTokens: sender.totalGptTokens,
          totalCaseSearchTokens: sender.totalCaseSearchTokens,
        },
      },
    };
  } catch (error) {
    console.log(error);
    throw new Error("Error while consuming token");
  }
}

async function createMessage(sessionId, prompt, isUser, mongoId) {
  try {
    console.log(sessionId, prompt);
    if (isUser) {
      // const updatedTokenVault = await consumeTokenGpt(mongoId, 1);
      const newMessage = await prisma.message.create({
        data: {
          sessionId,
          text: prompt,
          isUser,
        },
      });
      return {
        messageId: newMessage.id,
        message: newMessage.text,
        // ...updatedTokenVault,
      };
    } else {
      const newMessage = await prisma.message.create({
        data: {
          sessionId,
          text: prompt,
          isUser,
        },
      });
      return { messageId: newMessage.id, message: newMessage.text };
    }
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while creating new message",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function createSocketMessage(
  text,
  isDocument,
  contextId, // Can be null if no context
  isUser,
  sessionId
) {
  try {
    const newMessage = await prisma.message.create({
      data: {
        text,
        isDocument,
        contextId, // Can be null if no context
        isUser,
        sessionId,
      },
    });
    return newMessage;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while creating new message",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function RegenertaedMessage(sessionId, prompt, isUser, mongoId) {
  try {
    console.log(sessionId, prompt);
    if (isUser) {
      const newMessage = await prisma.message.create({
        data: {
          sessionId,
          text: prompt,
          isUser,
        },
      });
      return {
        messageId: newMessage.id,
        message: newMessage.text,
        // ...updatedTokenVault,
      };
    } else {
      // Find the latest message where isUser is false
      const latestMessage = await prisma.message.findFirst({
        where: {
          sessionId,
          isUser, // Only messages where isUser is false
        },
        orderBy: {
          createdAt: "desc", // Order by creation date descending
        },
        select: {
          id: true, // Select the ID to update it later
        },
      });

      if (!latestMessage) {
        console.log("No message found with isUser as false.");
        return;
      }

      // Update the response of the latest message
      const newMessage = await prisma.message.update({
        where: {
          id: latestMessage.id, // Use the ID of the found message
        },
        data: {
          text: prompt, // Set the new response
        },
      });

      console.log("Response updated successfully for the latest message.");
      return { messageId: newMessage.id, message: newMessage.text };
    }
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while creating new message",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function appendFeedbackMessageByMessageId(
  messageId,
  impression,
  feedbackType,
  feedbackMessage,
  userId
) {
  try {
    // Find the latest message where isUser is false
    // Create the feedback entry
    const feedback = await prisma.feedback.create({
      data: {
        messageId,
        impression,
        feedbackType,
        feedbackMessage,
        userId,
      },
    });
  } catch (error) {
    console.error("Error while fetching latest message:", error);
    throw new AppError(
      "Error while fetching latest message",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getPlansByUserId(mongoId) {
  try {
    // Fetch user plans with related plan data using `include`
    const userPlans = await prisma.userPlan.findMany({
      where: {
        userId: mongoId,
      },
      include: {
        plan: true, // Assuming there's a `plan` relation defined in the Prisma schema
      },
    });

    // Extract the plan names from the included plan data
    const planNames = userPlans.map((userPlan) => userPlan.plan.name);

    return planNames;
  } catch (e) {
    console.error("Error while fetching plans:", e);
    throw new AppError(
      "Error while fetching plans",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function fetchGptUserByPhoneNumbers(phoneNumbers) {
  try {
    const users = await prisma.user.findMany({
      where: {
        phoneNumber: {
          in: phoneNumbers,
        },
      },
      include: {
        plan: {
          select: {
            token: true,
          },
        },
      },
    });

    if (!users || users.length === 0) return []; // Return an empty array if no users found

    // Map through the users array to format the response
    const formattedUsers = users.map((user) => ({
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber,
      plan: user.planName, // Assuming user.planName exists on your user model
      token: { used: user.tokenUsed, total: user.plan.token }, // Assuming user.plan.token exists on your plan model
    }));

    return formattedUsers;
  } catch (error) {
    console.error("Error while fetching users:", error);
    throw new AppError(
      "Error while fetching users",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getUserPlan(mongoId) {
  try {
    const plans = await prisma.userAllPlan.findMany({
      where: {
        userId: mongoId,
      },
    });

    return plans;
  } catch (err) {
    console.error("Error while fetching users:", err);
    throw new AppError(
      "Error while fetching users",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function fetchGptUser(mongoId, currencyType) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        mongoId,
      },
      include: {
        plan: {
          select: {
            token: true,
          },
        },
      },
    });

    console.log(user);

    const plan = await getUserPlan(mongoId); // it can be open
    console.log(plan.length);
    console.log(new Date());

    // This free plan only for some occasionally

    if (plan.length === 0) {
      console.log("user do not have any plan. plan will be creating");

      const createAt = new Date();
      // const expiresAt = new Date(createAt.getTime() + 30 * 24 * 60 * 60 * 1000);

      await updateUserAdiraPlan(
        mongoId,
        "FREE",
        "15 MINUTES TRIAL",
        "",
        createAt,
        null,
        "",
        null,
        0,
        currencyType
      );

      console.log("plan created");
    }
    let plans = await prisma.userAllPlan.findMany({
      where: {
        userId: mongoId,
      },
      include: {
        plan: true,
      },
    });

    const client = await Client.findById(mongoId);

    if (!user) return null;
    return {
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber,
      plan: plans,
      totalUsed: client.totalUsed,
      email: client.email,
      phoneNumber: client.phoneNumber,
    };
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while fetching user",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function caseSearchOnCheck(phoneNumber) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        phoneNumber: phoneNumber,
        isCasesearch: true,
      },
      include: {
        plan: {
          select: {
            token: true,
          },
        },
      },
    });
    if (user) {
      return true;
    } else {
      return false;
    }
  } catch (error) {}
}

async function caseSearchOn(phoneNumber) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        phoneNumber: phoneNumber,
      },
      data: {
        isCasesearch: true,
      },
      select: {
        plan: {
          select: {
            token: true,
          },
        },
        planName: true,
        tokenUsed: true,
      },
    });
    return updatedUser;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while updating user for case search",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function fetchSessionBySessionId(sessionId) {
  try {
    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        modelName: true,
        user: {
          select: {
            mongoId: true,
          },
        },
      },
    });
    return session;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error fetching session by sessionId",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function fetchSessions(userId, model) {
  try {
    const userSessions = await prisma.session.findMany({
      where: {
        userId,
        modelName: model,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        name: true,
        updatedAt: true,
        id: true,
      },
    });

    return userSessions;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while fetching session",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function fetchSessionMessages(sessionId) {
  try {
    const sessionMessages = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            text: true,
            isUser: true,
            createdAt: true,
            contextId: true,
            contextMessage: true,
            isDocument: true,
          },
        },
      },
    });

    return sessionMessages;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while fetching session messages",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function CheckReferralCodeExistToUser(mongoId) {
  try {
    const existingCode = await prisma.referralCode.findUnique({
      where: {
        generatedById: mongoId,
      },
    });

    // console.log(existingCode);

    if (existingCode) return existingCode.referralCode;
    else return false;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while checking referral code existance",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function CheckReferralCodeExist(rCode) {
  const code = rCode();
  try {
    const existingCodeCount = await prisma.referralCode.count({
      where: {
        referralCode: code,
      },
    });

    if (existingCodeCount === 0) return true;
    else return false;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while checking referral code existance",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function createReferralCode(mongoId, rCode) {
  const code = rCode();
  try {
    const existingCodeCount = await prisma.referralCode.count({
      where: {
        generatedById: mongoId,
      },
    });

    if (existingCodeCount >= 5)
      throw new Error("Cannot generate more than 5 referral codes");

    const newReferralCode = await prisma.referralCode.create({
      data: {
        generatedById: mongoId,
        referralCode: code,
      },
    });

    return newReferralCode;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while generating new referral code",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function redeemReferralCode(referralCode, redeemedById) {
  // redeemedById = "665895d4ed964292d63d8f3d";
  console.log(referralCode, redeemedById);

  try {
    const updatedUser = await prisma.user.update({
      where: {
        mongoId: redeemedById,
        // planName: "free",
      },
      data: {
        // planName: "student",
        // tokenUsed: 0,
        redeemedReferralCodeId: referralCode,
      },
      select: {
        plan: {
          select: {
            token: true,
          },
        },
        planName: true,
        tokenUsed: true,
      },
    });

    return {
      plan: "student",
      token: { used: updatedUser.tokenUsed, total: updatedUser.plan.token },
    };
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while redeeming referral code",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function verifyReferralCode(referralCode, _id) {
  try {
    // const referralCodeExist = await CheckReferralCodeExist(referralCode);

    const referralCodes = await prisma.referralCode.findMany({
      where: {
        referralCode,
        // redeemedBy: null, // This means the referral code has not been redeemed yet
        redeemedAndPayBy: {
          some: {
            mongoId: _id, // The userId is the mongoId in the User model
          },
        },
      },
      include: {
        redeemedBy: true, // Include the `redeemedBy` users' details
      },
    });

    console.log(referralCodes);
    if (referralCodes.length !== 0) {
      return { message: "Referral code not valid", reason: "Already used" };
    }

    const alreadyUse = await prisma.newUserPlan.findFirst({
      where: {
        userId: _id,
        referralCodeId: referralCode,
      },
    });

    if (alreadyUse) {
      return { message: "Referral code not valid", reason: "Already used" };
    }

    const referralCodeExist = await prisma.referralCode.findUnique({
      where: {
        referralCode,
      },
    });

    console.log(referralCodeExist);
    if (!referralCodeExist) {
      return { message: "Referral code not valid" };
    } else {
      return {
        message: "Referral code valid",
        trialDays: referralCodeExist.freeTrial,
        discount: referralCodeExist.discount,
      };
    }
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while verifying referral code",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function fetchReferralDetails(mongoId) {
  try {
    const response = await prisma.user.findUnique({
      where: {
        mongoId,
      },
      select: {
        generatedReferralCode: true,
      },
    });

    // console.log(response);

    console.log(mongoId.toHexString());

    const userRedeemed = await prisma.referralCode.findFirst({
      where: {
        generatedById: mongoId.toHexString(),
      },
      select: {
        redeemedBy: true,
        redeemedAndPayBy: true,
      },
    });

    console.log("Redeemed users => ", userRedeemed);

    totaoRedeemedWithPayBy = userRedeemed.redeemedAndPayBy.length;
    totaoRedeemed = userRedeemed.redeemedBy.length;

    if (response && response.generatedReferralCode) {
      // const redeemCount = await prisma.user.count({
      //   where: {
      //     redeemedReferralCodeId: response.generatedReferralCode?.referralCode,
      //   },
      // });

      return {
        referralCode: response.generatedReferralCode,
        redeemCount: totaoRedeemedWithPayBy,
      };
    } else {
      return { referralCode: null, redeemCount: null };
    }
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while fetching referral details",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function fetchLastMessagePair(sessionId) {
  try {
    const lastMessagePair = await prisma.message.findMany({
      where: { sessionId },
      take: 2,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        text: true,
        id: true,
      },
    });
    return lastMessagePair;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while fetching message pair",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function checkIsAdmin(phoneNumber) {
  try {
    phoneNumber = phoneNumber.substring(3);
    // Fetch the user details
    const user = await prisma.user.findUnique({
      where: { phoneNumber: phoneNumber },
      include: { adminUser: true },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Check if the user is an admin
    const isAdmin = user.adminUserId !== null;
    return { phoneNumber: phoneNumber, isAdmin: isAdmin };
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while checking is admin",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function removeAdminUser(adminId, userId) {
  try {
    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Check if user exists and is associated with the admin
    const user = await prisma.user.findUnique({
      where: { mongoId: userId },
      include: { adminUser: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.adminUs == adminId) {
      return res
        .status(400)
        .json({ error: "User is not associated with this admin" });
    }

    // Update the user to dissociate from the admin
    const updatedUser = await prisma.user.update({
      where: { mongoId: userId },
      data: { adminUserId: null },
    });
    return updatedUser;
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while removing admin users",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getAdmins() {
  const admins = await prisma.admin.findMany({
    include: {
      users: true, // Include associated users
    },
  });

  return admins;
}

async function createAdmin(adminId, phoneNumber) {
  try {
    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Update the user to associate with the admin
    const updatedUser = await prisma.user.update({
      where: { phoneNumber: phoneNumber },
      data: { adminUserId: adminId },
    });

    return updatedUser;
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while creating admin",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function addFirstAdminUser(userId) {
  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { mongoId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new admin and associate the user
    const newAdmin = await prisma.admin.create({
      data: {
        users: {
          connect: { mongoId: userId },
        },
      },
    });

    // Update the user to associate with the new admin
    const updatedUser = await prisma.user.update({
      where: { mongoId: userId },
      data: { adminUserId: newAdmin.id },
    });

    return { updatedUser, newAdmin };
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while updating user plan",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateUserSubscription(
  mongoId,
  subscriptionId,
  isActive,
  subscriptionEndDate
) {
  let updatedUser;
  if (subscriptionEndDate) {
    updatedUser = await prisma.newUserPlan.update({
      where: {
        mongoId,
        subscriptionId: subscriptionId,
        expiresAt: subscriptionEndDate,
      },
      data: {
        isActive: isActive,
      },
    });
  } else {
    updatedUser = await prisma.newUserPlan.update({
      where: {
        mongoId,
        subscriptionId: subscriptionId,
      },
      data: {
        isActive: isActive,
      },
    });
  }
}

async function updateUserPlanPayment(phoneNumber, paymentId) {
  try {
    let userPlanData;
    phoneNumber = String(phoneNumber);

    if (phoneNumber.startsWith("+")) {
      phoneNumber = phoneNumber.substring(3);
    }
    const userData = await Client.findOne({ phoneNumber });

    const id = userData._id.toHexString();

    const userPlan = await prisma.userAdiraPlan.findFirst({
      where: {
        userId: id,
      },
    });
    // Check if the user plan exists
    if (userPlan) {
      // Add 30 days to the existing `expiresAt`
      const newExpiresAt = new Date(
        userPlan.expiresAt.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      // Update the user's plan with the new expiration date
      userPlanData = await prisma.userAdiraPlan.update({
        where: {
          userId_planName: {
            userId: id,
            planName: userPlan.planName, // Ensure `planName` is included
          },
        },
        data: {
          expiresAt: newExpiresAt,
          totalDocuments: {
            increment: 3,
          },
        },
      });
    }

    return userPlanData;
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while updating user plan",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function UpdatetoUserPurchase(
  mongoId,
  planName,
  paymentId,
  amountPaid,
  payment_link
) {
  console.log(mongoId, planName, paymentId, amountPaid);
  try {
    const planduration = planName.split("_")[1];
    let duration = planduration === "M" ? 30 : 365;

    const userPlan = await prisma.userPurchases.findFirst({
      where: {
        userId: mongoId,
        planName: planName,
        subscriptionId: payment_link,
      },
    });

    const dateToExpire = userPlan.expiresAt;
    let newDate = new Date(dateToExpire);
    newDate.setDate(dateToExpire.getDate() + duration);

    const userPlanUpdate = await prisma.userPurchases.update({
      where: {
        userId_planName: {
          userId: mongoId,
          planName: planName,
        },
      },
      data: {
        subscriptionId: paymentId,
        expiresAt: newDate,
        Paidprice: parseInt(amountPaid),
      },
    });

    return userPlanUpdate;
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while updating user plan",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function insertIntoUserPurchase(
  userId,
  planName,
  razorpay_order_id,
  existingSubscription,
  createdAt,
  refferalCode,
  couponCode,
  expiresAt,
  amount
) {
  try {
    // Insert into the UserPurchases table
    const updatePurchase = await prisma.userAdiraPurchases.create({
      data: {
        userId,
        planName,
        subscriptionId: razorpay_order_id,
        expiresAt,
        createdAt,
        referralCodeId: refferalCode,
        Paidprice: parseInt(amount),
        isCouponCode: couponCode,
      },
    });

    // Return the inserted data or success response
    return updatePurchase;
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while inserting into user purchase",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateUserPlan(
  mongoId,
  newPlan,
  razorpay_subscription_id,
  existingSubscription,
  createdAt,
  refferalCode,
  couponCode,
  expiresAt,
  amount
) {
  console.log(mongoId, newPlan);

  refferalCode = refferalCode === "" ? null : refferalCode;

  try {
    // const createdAtDate = new Date(createdAt).setHours(0, 0, 0, 0); // Set time to 00:00:00
    // const today = new Date().setHours(0, 0, 0, 0); // Set today's date to 00:00:00
    let updatedUserPlan;

    if (newPlan === "FREE_M") {
      updatedUserPlan = await prisma.newUserPlan.create({
        data: {
          userId: mongoId,
          planName: newPlan,
          subscriptionId: razorpay_subscription_id,
          isActive: true,
          createdAt,
          expiresAt,
          Paidprice: amount,
        },
      });
      return {
        user: updatedUserPlan.mongoId,
        plan: updatedUserPlan.planName,
      };
    }

    if (razorpay_subscription_id === "ambassador") {
      updatedUserPlan = await prisma.newUserPlan.create({
        data: {
          userId: mongoId,
          planName: newPlan,
          subscriptionId: razorpay_subscription_id,
          isActive: true,
          createdAt,
          expiresAt,
          Paidprice: amount,
        },
      });
      return {
        user: updatedUserPlan.mongoId,
        plan: updatedUserPlan.planName,
      };
    }

    if (newPlan === "ADDON_M") {
      updatedUserPlan = await prisma.newUserPlan.create({
        data: {
          userId: mongoId,
          planName: newPlan,
          subscriptionId: razorpay_subscription_id,
          isActive: true,
          createdAt,
          expiresAt,
          Paidprice: amount,
        },
      });
      return {
        user: updatedUserPlan.mongoId,
        plan: updatedUserPlan.planName,
      };
    }

    if (existingSubscription !== "") {
      // Find the plan that is active
      const activePlan = await prisma.newUserPlan.findFirst({
        where: {
          userId: mongoId,
          subscriptionId: existingSubscription,
          isActive: true,
        },
      });

      // If a plan is found, delete it
      if (activePlan) {
        deletePlan = await prisma.newUserPlan.delete({
          where: {
            userId_planName: {
              userId: activePlan.userId,
              planName: activePlan.planName,
            },
          },
        });
      }

      if (refferalCode || couponCode) {
        updatedUserPlan = await prisma.newUserPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            isActive: true,
            createdAt,
            expiresAt,
            referralCodeId: refferalCode,
            isCouponCode: couponCode,
            Paidprice: amount,
          },
        });

        if (refferalCode) {
          await prisma.referralCode.update({
            where: {
              referralCode: refferalCode,
            },
            data: {
              redeemedBy: {
                connect: { mongoId: mongoId },
              },
              redeemed: true,
            },
          });
        }
      } else {
        updatedUserPlan = await prisma.newUserPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            createdAt,
            expiresAt,
            isActive: true,
            Paidprice: amount,
          },
        });
      }
    } else {
      if (refferalCode || couponCode) {
        updatedUserPlan = await prisma.newUserPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            isActive: true,
            createdAt,
            expiresAt,
            referralCodeId: refferalCode,
            isCouponCode: couponCode,
            Paidprice: amount,
          },
        });

        if (refferalCode) {
          await prisma.referralCode.update({
            where: {
              referralCode: refferalCode,
            },
            data: {
              redeemedBy: {
                connect: { mongoId: mongoId },
              },
              redeemed: true,
            },
          });
        }
      } else {
        updatedUserPlan = await prisma.newUserPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            createdAt,
            expiresAt,
            isActive: true,
            Paidprice: amount,
          },
        });
      }
    }

    // if (existingSubscription) {
    //   // Find the plan that is active
    //   const activePlan = await prisma.newUserPlan.findFirst({
    //     where: {
    //       userId: mongoId,
    //       subscriptionId: existingSubscription,
    //       isActive: true,
    //     },
    //   });

    //   // If a plan is found, delete it
    //   if (activePlan) {
    //     deletePlan = await prisma.newUserPlan.delete({
    //       where: {
    //         userId_planName: {
    //           userId: activePlan.userId,
    //           planName: activePlan.planName,
    //         },
    //       },
    //     });
    //   }

    //   if (refferalCode || couponCode) {
    //     updatedUserPlan = await prisma.newUserPlan.create({
    //       data: {
    //         userId: mongoId,
    //         planName: newPlan,
    //         subscriptionId: razorpay_subscription_id,
    //         isActive: true,
    //         createdAt,
    //         expiresAt,
    //         referralCodeId: refferalCode,
    //         isCouponCode: couponCode,
    //       },
    //     });

    //     if (refferalCode) {
    //       await prisma.referralCode.update({
    //         where: {
    //           referralCode: refferalCode,
    //         },
    //         data: {
    //           redeemedBy: {
    //             connect: { mongoId: mongoId },
    //           },
    //           redeemed: true,
    //         },
    //       });
    //     }
    //   } else {
    //     updatedUserPlan = await prisma.newUserPlan.create({
    //       data: {
    //         userId: mongoId,
    //         planName: newPlan,
    //         subscriptionId: razorpay_subscription_id,
    //         createdAt,
    //         expiresAt,
    //         isActive: true,
    //       },
    //     });
    //   }
    // } else {
    //   if (refferalCode || couponCode) {
    //     updatedUserPlan = await prisma.newUserPlan.create({
    //       data: {
    //         userId: mongoId,
    //         planName: newPlan,
    //         subscriptionId: razorpay_subscription_id,
    //         isActive: true,
    //         createdAt,
    //         expiresAt,
    //         referralCodeId: refferalCode,
    //         isCouponCode: couponCode,
    //       },
    //     });

    //     if (refferalCode) {
    //       await prisma.referralCode.update({
    //         where: {
    //           referralCode: refferalCode,
    //         },
    //         data: {
    //           redeemedBy: {
    //             connect: { mongoId: mongoId },
    //           },
    //           redeemed: true,
    //         },
    //       });
    //     }
    //   } else {
    //     updatedUserPlan = await prisma.newUserPlan.create({
    //       data: {
    //         userId: mongoId,
    //         planName: newPlan,
    //         subscriptionId: razorpay_subscription_id,
    //         createdAt,
    //         expiresAt,
    //         isActive: true,
    //       },
    //     });
    //   }
    // }
    return {
      user: updatedUserPlan.mongoId,
      plan: updatedUserPlan.planName,
    };
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while updating user plan",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateUserAdiraPlan(
  mongoId,
  newPlan,
  razorpay_subscription_id,
  existingSubscription,
  createdAt,
  refferalCode,
  couponCode,
  expiresAt,
  amount,
  currencyType
) {
  console.log(mongoId, newPlan);

  refferalCode = refferalCode === "" ? null : refferalCode;

  try {
    let updatedUserPlan;

    if (existingSubscription == "compane" && currencyType === "INR") {
      const activePlan = await prisma.userAllPlan.findFirst({
        where: {
          userId: mongoId,
          // subscriptionId: existingSubscription,
          isActive: true,
        },
      });

      // If a plan is found, delete it
      if (activePlan) {
        deletePlan = await prisma.userAllPlan.delete({
          where: {
            userId_planName: {
              userId: activePlan.userId,
              planName: activePlan.planName,
            },
          },
        });
      }

      updatedUserPlan = await prisma.userAllPlan.create({
        data: {
          userId: mongoId,
          planName: newPlan,
          subscriptionId: razorpay_subscription_id,
          createdAt,
          expiresAt,
          isActive: true,
          Paidprice: parseInt(amount),
        },
        include: {
          plan: true,
        },
      });

      return {
        user: updatedUserPlan.mongoId,
        plan: updatedUserPlan.planName,
      };
    }

    if (existingSubscription == "compane" && currencyType === "USD") {
      const activePlan = await prisma.userAllUSPlan.findFirst({
        where: {
          userId: mongoId,
          // subscriptionId: existingSubscription,
          isActive: true,
        },
      });

      // If a plan is found, delete it
      if (activePlan) {
        deletePlan = await prisma.userAllUSPlan.delete({
          where: {
            userId_planName: {
              userId: activePlan.userId,
              planName: activePlan.planName,
            },
          },
        });
      }

      updatedUserPlan = await prisma.userAllUSPlan.create({
        data: {
          userId: mongoId,
          planName: newPlan,
          subscriptionId: razorpay_subscription_id,
          createdAt,
          expiresAt,
          isActive: true,
          Paidprice: parseInt(amount),
        },
        include: {
          plan: true,
        },
      });

      return {
        user: updatedUserPlan.mongoId,
        plan: updatedUserPlan.planName,
      };
    }

    if (existingSubscription == "compane" && currencyType === "GBP") {
      const activePlan = await prisma.userAllUKPlan.findFirst({
        where: {
          userId: mongoId,
          // subscriptionId: existingSubscription,
          isActive: true,
        },
      });

      // If a plan is found, delete it
      if (activePlan) {
        deletePlan = await prisma.userAllUKPlan.delete({
          where: {
            userId_planName: {
              userId: activePlan.userId,
              planName: activePlan.planName,
            },
          },
        });
      }

      updatedUserPlan = await prisma.userAllUKPlan.create({
        data: {
          userId: mongoId,
          planName: newPlan,
          subscriptionId: razorpay_subscription_id,
          createdAt,
          expiresAt,
          isActive: true,
          Paidprice: parseInt(amount),
        },
        include: {
          plan: true,
        },
      });

      return {
        user: updatedUserPlan.mongoId,
        plan: updatedUserPlan.planName,
      };
    }

    if (newPlan === "FREE") {
      updatedUserPlan = await prisma.userAllPlan.create({
        data: {
          userId: mongoId,
          planName: newPlan,
          subscriptionId: razorpay_subscription_id,
          isActive: true,
          createdAt,
          expiresAt,
          Paidprice: parseInt(amount),
        },
      });
      return {
        user: updatedUserPlan.mongoId,
        plan: updatedUserPlan.planName,
      };
    }

    if (existingSubscription !== "" && currencyType === "INR") {
      // Find the plan that is active
      const activePlan = await prisma.userAllPlan.findFirst({
        where: {
          userId: mongoId,
          subscriptionId: existingSubscription,
          isActive: true,
        },
      });

      // If a plan is found, delete it
      if (activePlan) {
        deletePlan = await prisma.userAllPlan.delete({
          where: {
            userId_planName: {
              userId: activePlan.userId,
              planName: activePlan.planName,
            },
          },
        });
      }

      if (refferalCode || couponCode) {
        updatedUserPlan = await prisma.userAllPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            isActive: true,
            createdAt,
            expiresAt,
            referralCodeId: refferalCode,
            isCouponCode: couponCode,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });

        if (refferalCode) {
          await prisma.referralCode.update({
            where: {
              referralCode: refferalCode,
            },
            data: {
              redeemedBy: {
                connect: { mongoId: mongoId },
              },
              redeemed: true,
            },
          });
        }
      } else {
        updatedUserPlan = await prisma.userAllPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            createdAt,
            expiresAt,
            isActive: true,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });
      }
    } else {
      if (refferalCode || couponCode) {
        updatedUserPlan = await prisma.userAllPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            isActive: true,
            createdAt,
            expiresAt,
            referralCodeId: refferalCode,
            isCouponCode: couponCode,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });

        if (refferalCode) {
          await prisma.referralCode.update({
            where: {
              referralCode: refferalCode,
            },
            data: {
              redeemedBy: {
                connect: { mongoId: mongoId },
              },
              redeemed: true,
            },
          });
        }
      } else {
        updatedUserPlan = await prisma.userAllPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            createdAt,
            expiresAt,
            isActive: true,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });
      }
    }

    if (existingSubscription !== "" && currencyType === "USD") {
      // Find the plan that is active
      const activePlan = await prisma.userAllUSPlan.findFirst({
        where: {
          userId: mongoId,
          subscriptionId: existingSubscription,
          isActive: true,
        },
      });

      // If a plan is found, delete it
      if (activePlan) {
        deletePlan = await prisma.userAllUSPlan.delete({
          where: {
            userId_planName: {
              userId: activePlan.userId,
              planName: activePlan.planName,
            },
          },
        });
      }

      if (refferalCode || couponCode) {
        updatedUserPlan = await prisma.userAllUSPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            isActive: true,
            createdAt,
            expiresAt,
            referralCodeId: refferalCode,
            isCouponCode: couponCode,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });

        if (refferalCode) {
          await prisma.referralCode.update({
            where: {
              referralCode: refferalCode,
            },
            data: {
              redeemedBy: {
                connect: { mongoId: mongoId },
              },
              redeemed: true,
            },
          });
        }
      } else {
        updatedUserPlan = await prisma.userAllUSPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            createdAt,
            expiresAt,
            isActive: true,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });
      }
    } else {
      if (refferalCode || couponCode) {
        updatedUserPlan = await prisma.userAllUSPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            isActive: true,
            createdAt,
            expiresAt,
            referralCodeId: refferalCode,
            isCouponCode: couponCode,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });

        if (refferalCode) {
          await prisma.referralCode.update({
            where: {
              referralCode: refferalCode,
            },
            data: {
              redeemedBy: {
                connect: { mongoId: mongoId },
              },
              redeemed: true,
            },
          });
        }
      } else {
        updatedUserPlan = await prisma.userAllUSPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            createdAt,
            expiresAt,
            isActive: true,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });
      }
    }

    if (existingSubscription !== "" && currencyType === "GBP") {
      // Find the plan that is active
      const activePlan = await prisma.userAllUKPlan.findFirst({
        where: {
          userId: mongoId,
          subscriptionId: existingSubscription,
          isActive: true,
        },
      });

      // If a plan is found, delete it
      if (activePlan) {
        deletePlan = await prisma.userAllUKPlan.delete({
          where: {
            userId_planName: {
              userId: activePlan.userId,
              planName: activePlan.planName,
            },
          },
        });
      }

      if (refferalCode || couponCode) {
        updatedUserPlan = await prisma.userAllUKPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            isActive: true,
            createdAt,
            expiresAt,
            referralCodeId: refferalCode,
            isCouponCode: couponCode,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });

        if (refferalCode) {
          await prisma.referralCode.update({
            where: {
              referralCode: refferalCode,
            },
            data: {
              redeemedBy: {
                connect: { mongoId: mongoId },
              },
              redeemed: true,
            },
          });
        }
      } else {
        updatedUserPlan = await prisma.userAllUKPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            createdAt,
            expiresAt,
            isActive: true,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });
      }
    } else {
      if (refferalCode || couponCode) {
        updatedUserPlan = await prisma.userAllUKPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            isActive: true,
            createdAt,
            expiresAt,
            referralCodeId: refferalCode,
            isCouponCode: couponCode,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });

        if (refferalCode) {
          await prisma.referralCode.update({
            where: {
              referralCode: refferalCode,
            },
            data: {
              redeemedBy: {
                connect: { mongoId: mongoId },
              },
              redeemed: true,
            },
          });
        }
      } else {
        updatedUserPlan = await prisma.userAllUKPlan.create({
          data: {
            userId: mongoId,
            planName: newPlan,
            subscriptionId: razorpay_subscription_id,
            createdAt,
            expiresAt,
            isActive: true,
            Paidprice: parseInt(amount),
          },
          include: {
            plan: true,
          },
        });
      }
    }

    return {
      user: updatedUserPlan.userId,
      plan: updatedUserPlan,
    };
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while updating user plan",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateIsAmbassadorBenifined(mongoId, bool) {
  try {
    const updatedUser = await prisma.user.update({
      where: { mongoId },
      data: { isambassadorBenifined: bool },
    });
    return updatedUser;
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while updating user ambassador benifined status",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function handleFirstPayment(userId, subscriptionId) {
  // Do something special for the first payment, like granting a bonus or sending an email

  const refferalCode = await prisma.newUserPlan.findFirst({
    where: {
      userId: userId,
      subscriptionId: subscriptionId,
    },
  });

  const code = refferalCode.referralCodeId;

  await prisma.referralCode.update({
    where: {
      referralCode: code,
    },
    data: {
      redeemedAndPayBy: {
        connect: { mongoId: userId },
      },
    },
  });
}

// async function updateUserPlan(mongoId, newPlan, expiresAt) {
//   console.log(mongoId, newPlan);
//   try {
//     if (expiresAt) {
//       const updatedUserPlan = await prisma.userPlan.create({
//         data: {
//           userId: mongoId,
//           planName: newPlan,
//           expiresAt: expiresAt,
//         },
//       });
//     } else {
//       const updatedUserPlan = await prisma.userPlan.create({
//         data: {
//           userId: mongoId,
//           planName: newPlan,
//         },
//       });
//     }

//     const Pdata = await prisma.plan.findUnique({
//       where: { name: newPlan },
//     });

//     // console.log(plansData);
//     let totalGptTokens = Pdata.gptToken;
//     let totalCaseSearchTokens = Pdata.caseSearchToken;

//     console.log(totalGptTokens, totalCaseSearchTokens);

//     const updatedUser = await prisma.user.update({
//       where: {
//         mongoId: mongoId,
//       },
//       data: {
//         totalGptTokens: {
//           increment: totalGptTokens, // or any other value you want to increment by
//         },
//         totalCaseSearchTokens: {
//           increment: totalCaseSearchTokens, // or any other value you want to increment by
//         },
//       },
//     });

//     console.log(updatedUser);

//     return {
//       user: updatedUser.mongoId,
//       plan: newPlan,
//     };
//   } catch (error) {
//     console.error(error);
//     throw new AppError(
//       "Error while updating user plan",
//       StatusCodes.INTERNAL_SERVER_ERROR
//     );
//   }
// }

async function removeUserPlans(userId, planNames) {
  try {
    const supUser = await prisma.user.findUnique({
      where: { mongoId: userId },
    });

    for (const planName of planNames) {
      const userPlan = await prisma.userPlan.findUnique({
        where: {
          userId_planName: {
            userId: userId,
            planName: planName,
          },
        },
      });

      if (userPlan) {
        await prisma.userPlan.delete({
          where: {
            userId_planName: {
              userId: userId,
              planName: planName,
            },
          },
        });
        console.log(`Removed plan ${planName} for user ${userId}`);

        const Pdata = await prisma.plan.findUnique({
          where: { name: planName },
        });

        let totalGptTokens = Pdata.gptToken;
        let totalCaseSearchTokens = Pdata.caseSearchToken;
        let totalGptTokenUsed = supUser.gptTokenUsed - totalGptTokens;

        if (totalGptTokenUsed < 0) {
          totalGptTokenUsed = 0;
        }

        let totalCaseSearchTokenUsed =
          supUser.caseSearchTokenUsed - totalCaseSearchTokens;
        if (totalCaseSearchTokenUsed < 0) {
          totalCaseSearchTokenUsed = 0;
        }

        console.log(totalGptTokenUsed, totalCaseSearchTokenUsed);

        await prisma.user.update({
          where: {
            mongoId: userId,
          },
          data: {
            totalGptTokens: {
              decrement: totalGptTokens, // or any other value you want to increment by
            },
            totalCaseSearchTokens: {
              decrement: totalCaseSearchTokens, // or any other value you want to increment by
            },
            caseSearchTokenUsed: totalCaseSearchTokenUsed,
            gptTokenUsed: totalGptTokenUsed,
          },
        });
      } else {
        console.log(`Plan ${planName} not found for user ${userId}`);
      }
    }
    return { userId, planNames };
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while updating user plan",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateStateLocation(mongoId, state) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        mongoId,
      },
      data: {
        StateLocation: state.location,
      },
      select: {
        StateLocation: true,
        // planName: true,
        // tokenUsed: true,
      },
    });

    return {
      StateLocation: updatedUser.StateLocation,
      // token: { used: updatedUser.tokenUsed, total: updatedUser.plan.token },
    };
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while updating user plan",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function deleteSessions(mongoId, modelName) {
  try {
    await prisma.session.deleteMany({
      where: {
        userId: mongoId,
        modelName,
      },
    });
    return;
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while deleting user sessions",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function storeUsedTimeService(id) {
  try {
    // const user = await Client.findByIdAndUpdate(id, {
    //   $inc: {
    //     totalUsed: 1,
    //   },
    // });

    const userPlanData = await prisma.userAllPlan.findFirst({
      where: {
        userId: id,
      },
    });

    const user = await prisma.userAllPlan.update({
      where: {
        userId_planName: {
          userId: id, // Make sure this is the correct field name
          planName: userPlanData?.planName, // Assuming you have planName from the userPlanData
        },
      },
      data: {
        UsedLegalGPTime: { increment: 1 },
      },
    });

    return user;
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while storing used time service",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function cancelSubscription(mongoId, planName) {
  try {
    const userPlan = await prisma.newUserPlan.findUnique({
      where: {
        userId_planName: { userId: mongoId, planName },
      },
    });
    if (userPlan) {
      await prisma.newUserPlan.delete({
        where: {
          userId_planName: { userId: mongoId, planName },
        },
      });
    }
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while fetching user",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getPurchaseHistory(id) {
  try {
    const purchaseHistory = await prisma.userAdiraPurchases.findMany({
      where: { userId: id },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        plan: true,
      },
    });

    return purchaseHistory;
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Error while fetching purchase history",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function Fetchingtranslate(context, language) {
  try {
    const fetchedTranslations = await fetch(
      `${FLASK_API_ENDPOINT}/gpt/translate`,
      {
        method: "POST",
        body: JSON.stringify({ context, language }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!fetchedTranslations.ok) {
      const error = await fetchedTranslations.text();
      console.log(error);
      throw new Error(`Failed to fetch translations `);
    }

    const translations = await fetchedTranslations.json();

    const res = JSON.parse(translations);

    return res;
  } catch (error) {
    console.error(error);
    throw new AppError(
      "Failed to fetch translations",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function generateInvoicePDF(userId, planName) {
  try {
    console.log(
      "Generating PDF for userId:",
      userId,
      "and planName:",
      planName
    );

    // Fetch user plan details from the database
    const userPlan = await prisma.newUserPlan.findUnique({
      where: {
        userId_planName: { userId: String(userId), planName: String(planName) },
      },
      include: {
        user: true,
        plan: true,
        referralCode: true,
      },
    });

    console.log("Fetched userPlan:", userPlan);

    if (!userPlan) {
      console.error(
        `User plan not found for userId: ${userId}, planName: ${planName}`
      );
      throw new Error("User plan not found");
    }

    // Extract data
    const {
      user,
      referralCode,
      isCouponCode,
      createdAt,
      expiresAt,
      Paidprice,
    } = userPlan;
    const { name: userName, phoneNumber } = user;

    // Determine whether to show name or phone number
    const displayName = userName ? userName : phoneNumber;

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    let pdfBuffer = [];

    // Collect PDF data chunks
    doc.on("data", (chunk) => {
      console.log("PDF chunk received");
      pdfBuffer.push(chunk);
    });

    doc.on("end", () => {
      console.log("PDF generation completed");
    });

    // Add content to the PDF
    doc
      .fillColor("#1E88E5")
      .fontSize(20)
      .text("Claw Legaltech", { align: "left" });
    doc
      .fillColor("#333333")
      .fontSize(10)
      .text("www.clawlaw.in", { align: "right" });

    doc
      .moveTo(50, 90)
      .lineTo(550, 90)
      .strokeColor("#1E88E5")
      .lineWidth(2)
      .stroke();

    // User details
    doc
      .moveDown()
      .fillColor("#333333")
      .fontSize(12)
      .text("User Details", { underline: true });
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`Name / Mobile No.: ${displayName}`, 50, 120, {
        fillColor: "#000000",
      });
    doc
      .font("Helvetica")
      .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 135);

    // Plan details header
    doc.moveDown().fillColor("#FFFFFF").rect(50, 160, 500, 20).fill("#004D40");
    doc.fillColor("#FFFFFF").fontSize(12).text("Plan Details", 60, 165);

    // Plan information
    doc.moveDown().fillColor("#333333").fontSize(10);
    doc
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(`Plan Name: ${planName}`, 50, 200);
    doc
      .font("Helvetica")
      .text(`Plan Start Date: ${createdAt.toLocaleDateString()}`, 50, 215);
    doc.text(
      `Plan End Date: ${
        expiresAt ? new Date(expiresAt).toLocaleDateString() : "N/A"
      }`,
      50,
      230
    );
    doc.text(`Rate: Rs.${Paidprice.toFixed(2)} /-`, 400, 215);

    if (isCouponCode) {
      doc.text(`Coupon Code: ${isCouponCode}`, 50, 255);
    }

    // Total amount section
    doc.moveDown().fillColor("#004D40").rect(50, 275, 500, 20).fill();
    doc.fillColor("#FFFFFF").fontSize(12).text("Total", 60, 280);
    doc.text(`Rs.${Paidprice.toFixed(2)} /-`, 400, 280);

    if (referralCode) {
      doc
        .moveDown()
        .fillColor("#333333")
        .fontSize(10)
        .text(`Referral Code: ${referralCode.referralCode}`, 50, 310);
    }

    // Watermark (CLAW)
    doc.fontSize(80).fillColor("rgba(0, 0, 0, 0.1)").text("CLAW", 150, 300, {
      angle: 45, // Rotate the watermark
      opacity: 0.1, // Light opacity
      font: "Helvetica-Bold",
    });

    // Note and footer (left aligned)
    doc
      .moveDown()
      .fontSize(8)
      .fillColor("#333333")
      .text(
        "NOTE: This Invoice Is Generated By Claw Legaltech Website.",
        50,
        650
      )
      .text("If You Have Any Queries, Kindly Contact Administrator.", 50, 665);

    doc
      .moveTo(50, 750)
      .lineTo(550, 750)
      .strokeColor("#1E88E5")
      .lineWidth(1)
      .stroke();

    // End the document
    doc.end();

    // Wait for the document to end, then send the PDF buffer
    await new Promise((resolve) => doc.on("end", resolve));

    // Convert the PDF chunks into a complete buffer and return it
    return Buffer.concat(pdfBuffer);
  } catch (error) {
    console.error("Error in generateInvoicePDF service:", error);
    throw new Error("Error while generating invoice");
  }
}

module.exports = {
  createMessage,
  createSession,
  createGptUser,
  incrementNumberOfSessions,
  createModel,
  createPlan,
  fetchSessions,
  fetchSessionMessages,
  fetchContext,
  fetchGptUser,
  fetchSessionBySessionId,
  createReferralCode,
  redeemReferralCode,
  fetchReferralDetails,
  consumeTokenCaseSearch,
  fetchLastMessagePair,
  updateUserPlan,
  deleteSessions,
  updateStateLocation,
  CheckReferralCodeExist,
  CheckReferralCodeExistToUser,
  fetchGptUserByPhoneNumbers,
  addFirstAdminUser,
  createAdmin,
  getAdmins,
  removeAdminUser,
  checkIsAdmin,
  caseSearchOn,
  caseSearchOnCheck,
  consumeTokenGpt,
  getPlansByUserId,
  removeUserPlans,
  getUserPlan,
  updateUserSubscription,
  verifyReferralCode,
  handleFirstPayment,
  fetchContextForRegenerate,
  RegenertaedMessage,
  appendFeedbackMessageByMessageId,
  updateIsAmbassadorBenifined,
  updateUserPlanPayment,
  cancelSubscription,
  insertIntoUserPurchase,
  UpdatetoUserPurchase,
  getPurchaseHistory,
  Fetchingtranslate,
  generateInvoicePDF,
  createSocketMessage,
  updateUserAdiraPlan,
  storeUsedTimeService,
  createGptUserForCompain,
};
