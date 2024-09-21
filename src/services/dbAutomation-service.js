const prisma = require("../config/prisma-client");

async function handleExpiredPlans() {
  try {
    const utcDate = new Date(); // Get the current UTC time
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30 in milliseconds
    const now = new Date(utcDate.getTime() + istOffset);

    console.log(now);

    // Calculate dates for comparison
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // Find all user plans that have expired
    const expiredPlans = await prisma.userPlan.findMany({
      where: {
        OR: [
          {
            plan: {
              duration: "monthly",
            },
            createdAt: {
              lte: oneMonthAgo,
            },
          },
          {
            plan: {
              duration: "yearly",
            },
            createdAt: {
              lte: oneYearAgo,
            },
          },
          {
            expiresAt: {
              lte: now,
            },
          },
        ],
      },
    });

    for (const userPlan of expiredPlans) {
      const { userId, planName } = userPlan;

      // Remove expired plan
      await prisma.userPlan.delete({
        where: {
          userId_planName: {
            userId,
            planName,
          },
        },
      });
      console.log(`Removed expired plan ${planName} for user ${userId}`);

      // Update tokens
      await updateUserTokens(userId, planName);
    }
  } catch (error) {
    console.error("Error handling expired plans:", error);
  }
}

async function updateUserTokens(userId, planName) {
  try {
    const supUser = await prisma.user.findUnique({
      where: { mongoId: userId },
    });

    const planData = await prisma.plan.findUnique({
      where: { name: planName },
    });

    if (!planData) {
      console.log(`Plan ${planName} not found`);
      return;
    }

    // Calculate updated token values
    let totalGptTokens = planData.gptToken;
    let totalCaseSearchTokens = planData.caseSearchToken;

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

    // Update user tokens
    await prisma.user.update({
      where: {
        mongoId: userId,
      },
      data: {
        totalGptTokens: {
          decrement: totalGptTokens,
        },
        totalCaseSearchTokens: {
          decrement: totalCaseSearchTokens,
        },
        caseSearchTokenUsed: totalCaseSearchTokenUsed,
        gptTokenUsed: totalGptTokenUsed,
      },
    });
  } catch (error) {
    console.error("Error updating user tokens:", error);
  }
}

module.exports = {
  handleExpiredPlans,
  updateUserTokens,
};
