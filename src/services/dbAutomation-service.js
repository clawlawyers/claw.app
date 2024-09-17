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
    const expiredPlans = await prisma.newUserPlan.findMany({
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

async function activateTodaysNewUserPlans() {
  try {
    // Get the current date (IST) without time
    const utcDate = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const now = new Date(utcDate.getTime() + istOffset);

    // Strip the time part to compare only the date
    const todayStart = new Date(now.setHours(0, 0, 0, 0)); // Start of today
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000); // Start of tomorrow

    console.log("Today's date:", todayStart);

    // Find all new user plans created today and are not active yet
    const newUserPlans = await prisma.newUserPlan.findMany({
      where: {
        createdAt: {
          gte: todayStart, // Plan created on or after the start of today
          lt: tomorrowStart, // Plan created before the start of tomorrow
        },
        isActive: false, // Only find plans that are not yet active
      },
    });

    // Activate all plans created today
    for (const plan of newUserPlans) {
      const { userId, planName } = plan;

      // Update the plan to make it active
      await prisma.newUserPlan.update({
        where: {
          userId_planName: {
            userId,
            planName,
          },
        },
        data: {
          isActive: true,
        },
      });

      console.log(`Activated plan ${planName} for user ${userId}`);
    }
  } catch (error) {
    console.error("Error activating today's new user plans:", error);
  }
}

async function deactivateExpiredUserPlans() {
  try {
    // Get the current date (IST) without time
    const utcDate = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const now = new Date(utcDate.getTime() + istOffset);

    // Strip the time part to compare only the date
    const todayStart = new Date(now.setHours(0, 0, 0, 0)); // Start of today

    console.log("Today's date (start):", todayStart);

    // Find all user plans where the expiration date is before today and they are still active
    const expiredUserPlans = await prisma.newUserPlan.findMany({
      where: {
        expiresAt: {
          lt: todayStart, // Expiration date is before today
        },
        isActive: true, // Only find plans that are currently active
      },
    });

    // Deactivate all expired plans
    for (const plan of expiredUserPlans) {
      const { userId, planName } = plan;

      // Update the plan to make it inactive
      await prisma.newUserPlan.update({
        where: {
          userId_planName: {
            userId,
            planName,
          },
        },
        data: {
          isActive: false,
        },
      });

      console.log(`Deactivated expired plan ${planName} for user ${userId}`);
    }
  } catch (error) {
    console.error("Error deactivating expired user plans:", error);
  }
}

module.exports = {
  handleExpiredPlans,
  updateUserTokens,
  activateTodaysNewUserPlans,
  deactivateExpiredUserPlans,
};
