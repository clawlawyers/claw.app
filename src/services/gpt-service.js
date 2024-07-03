const prisma = require("../config/prisma-client");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

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

async function consumeToken(mongoId, count = 1) {
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
          totalTokenUsed: {
            increment: count,
          },
        },
        include: {
          plan: { select: { token: true } },
        },
      });

      console.log(sender);

      if (sender.tokenUsed.toFixed(1) > sender.plan.token)
        throw new Error(
          `User does not have enough tokens, user - ${mongoId}, token to be used - ${count}`
        );
      return sender;
    });
    return {
      token: { used: sender.tokenUsed.toFixed(1), total: sender.plan.token },
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
      const updatedTokenVault = await consumeToken(mongoId, 1);
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
        ...updatedTokenVault,
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

async function fetchGptUser(mongoId) {
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
    if (!user) return null;
    return {
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber,
      plan: user.planName,
      token: { used: user.tokenUsed, total: user.plan.token },
    };
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Error while fetching user",
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
        planName: "student",
        tokenUsed: 0,
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

    console.log(response);
    if (response && response.generatedReferralCode) {
      const redeemCount = await prisma.user.count({
        where: { redeemedReferralCodeId: response.generatedReferralCode?.id },
      });

      return { referralCode: response.generatedReferralCode, redeemCount };
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

    if (user.adminUserId !== adminId) {
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

async function createAdmin(adminId, userId) {
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
      where: { mongoId: userId },
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

async function updateUserPlan(mongoId, newPlan) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        mongoId,
      },
      data: {
        planName: newPlan,
        tokenUsed: 0,
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
      plan: updatedUser.planName,
      token: { used: updatedUser.tokenUsed, total: updatedUser.plan.token },
    };
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
  consumeToken,
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
};
