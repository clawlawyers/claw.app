const mongoose = require("mongoose");
const { GptServices, ClientService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user"); // Adjust the path as per your project structure
const Coupon = require("../models/coupon");
const Tracking = require("../models/tracking");
const moment = require("moment");

async function updateUserPlan(req, res) {
  try {
    const { id, planName } = req.body;
    const updatePlan = await GptServices.updateUserPlan(id, planName);
    res.setHeader("Content-Type", "application/json");
    return res.status(StatusCodes.OK).json(SuccessResponse(updatePlan));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function generateReferralCode(req, res) {
  try {
    const { _id, firstName, lastName, collegeName } = req.body.client;

    console.log(req.body.client);

    const updatedClient = await ClientService.updateClient(_id, {
      firstName,
      lastName,
      collegeName,
      ambassador: true,
    });

    // console.log(updatedClient);

    const referralCodeExist = await GptServices.CheckReferralCodeExistToUser(
      _id
    );

    // console.log(referralCodeExist);

    if (referralCodeExist) {
      return res.status(StatusCodes.OK).json(
        SuccessResponse({
          message: "Referral Code Already Exists",
          referralCode: referralCodeExist,
          redeemCount: 0,
          client: {
            firstName,
            lastName,
            collegeName,
          },
        })
      );
    }
    const checkCodeAlreadyExist = async (rCode) => {
      await GptServices.CheckReferralCodeExist(rCode);
    };

    const rCode = () => {
      return firstName?.substr(0, 3) + Math.floor(100 + Math.random() * 900);
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

async function getReferralCodes(req, res) {
  try {
    const referralCodes = await prisma.referralCode.findMany({
      include: {
        generatedBy: {
          select: {
            phoneNumber: true,
          },
        },
        redeemedBy: {
          select: {
            phoneNumber: true,
          },
        },
      },
    });

    // Extract unique phone numbers from generatedBy and redeemedBy
    const userPhoneNumbers = [
      ...new Set([
        ...referralCodes.map((code) => code.generatedBy.phoneNumber),
        ...referralCodes.flatMap((code) =>
          code.redeemedBy.map((user) => user.phoneNumber)
        ),
      ]),
    ];

    // Fetch user details from MongoDB
    const users = await ClientService.getClientByPhoneNumbers(userPhoneNumbers);

    // Fetch user details from Supabase

    const SupaUsers = await GptServices.fetchGptUserByPhoneNumbers(
      userPhoneNumbers
    );

    // console.log(SupaUsers);

    // Map through referral codes and merge user details
    const formattedReferralCodes = referralCodes.map((code) => {
      // Find generatedBy user
      const generatedByUser = users.find(
        (u) => u.phoneNumber === code.generatedBy.phoneNumber
      );

      console.log(generatedByUser);

      // Map redeemedBy users
      const redeemedByUsers = code.redeemedBy.map((redeemedUser) => {
        const user = users.find(
          (u) => u.phoneNumber === redeemedUser.phoneNumber
        );
        const supaUser = SupaUsers.find(
          (u) => u.phoneNumber === redeemedUser.phoneNumber
        );

        // Format engagement time
        const engagementTime = user?.engagementTime
          ? {
              daily: Array.from(user.engagementTime.daily.values())
                .reduce((a, b) => a + b, 0)
                .toFixed(2),
              monthly: Array.from(user.engagementTime.monthly.values())
                .reduce((a, b) => a + b, 0)
                .toFixed(2),
              yearly: Array.from(user.engagementTime.yearly.values())
                .reduce((a, b) => a + b, 0)
                .toFixed(2),
              total: user.engagementTime.total.toFixed(2),
            }
          : null;

        return {
          phoneNumber: redeemedUser.phoneNumber,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          plan: supaUser
            ? {
                planName: supaUser.plan,
                token: {
                  used: supaUser.token.used,
                  total: supaUser.token.total,
                },
              }
            : null,
          engagedTime: engagementTime,
        };
      });

      return {
        id: code.id,
        referralCode: code.referralCode,
        redeemed: code.redeemed,
        createdAt: code.createdAt,
        updatedAt: code.updatedAt,
        generatedBy: {
          phoneNumber: code.generatedBy.phoneNumber,
          firstName: generatedByUser?.firstName || "",
          lastName: generatedByUser?.lastName || "",
          // plan: generatedByUser
          //   ? {
          //       planName: generatedByUser.planName,
          //       token: {
          //         used: generatedByUser.tokenUsed,
          //         total: generatedByUser.plan.token,
          //       },
          //     }
          //   : null,
        },
        redeemedBy: redeemedByUsers,
      };
    });

    // console.log(formattedReferralCodes);

    res.json(formattedReferralCodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPlans(req, res) {
  try {
    const plans = await prisma.plan.findMany();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({});

    // Filter users on the server side
    const filteredUsers = users.filter((user) => {
      const phoneNumber = user.phoneNumber;
      const startsWithValidDigit = /^[9876]/.test(phoneNumber);
      const allDigitsSame = /^(\d)\1*$/.test(phoneNumber);
      return startsWithValidDigit && !allDigitsSame;
    });

    console.log(filteredUsers.length);

    const MongoUser = await ClientService.getAllClientsDetails();

    const filteredUsersMongo = MongoUser.filter((Muser) => {
      const phoneNumber = Muser.phoneNumber;
      const startsWithValidDigit = /^[9876]/.test(phoneNumber);
      const allDigitsSame = /^(\d)\1*$/.test(phoneNumber);
      return startsWithValidDigit && !allDigitsSame;
    });

    console.log(filteredUsersMongo.length);

    // Merge the filtered users from both MongoDB and Supabase
    const mergedUsers = filteredUsers.map((Muser) => {
      const user = filteredUsersMongo.find(
        (user) => user.phoneNumber === Muser.phoneNumber
      );
      console.log({
        mongoId: Muser.mongoId,
        phoneNumber: Muser.phoneNumber,
        createdAt: Muser.createdAt,
        updatedAt: Muser.updatedAt,
        totalTokenUsed: Muser.totalTokenUsed,
        StateLocation: Muser.StateLocation,
        numberOfSessions: Muser.numberOfSessions,
        planName: Muser.planName,
        ambassador: user.ambassador,
        engagementTime: user.engagementTime,
        firstName: user.firstName,
        lastName: user.lastName,
        collegeName: user.collegeName,
      });
      if (user) {
        // Format engagement time
        const engagementTime = user?.engagementTime
          ? {
              daily: Array.from(user.engagementTime.daily.values())
                .reduce((a, b) => a + b, 0)
                .toFixed(2),
              monthly: Array.from(user.engagementTime.monthly.values())
                .reduce((a, b) => a + b, 0)
                .toFixed(2),
              yearly: Array.from(user.engagementTime.yearly.values())
                .reduce((a, b) => a + b, 0)
                .toFixed(2),
              total: user.engagementTime.total.toFixed(2),
            }
          : null;

        return {
          mongoId: Muser.mongoId,
          phoneNumber: Muser.phoneNumber,
          createdAt: Muser.createdAt,
          updatedAt: Muser.updatedAt,
          totalTokenUsed: Muser.totalTokenUsed,
          StateLocation: Muser.StateLocation,
          numberOfSessions: Muser.numberOfSessions,
          planName: Muser.planName,
          ambassador: user.ambassador,
          engagementTime: engagementTime,
          firstName: user.firstName,
          lastName: user.lastName,
          collegeName: user.collegeName,
          averageSessionEngagementTime:
            engagementTime?.total / Muser?.numberOfSessions,
        };
      }
    });

    console.log(mergedUsers);

    // Send the filtered users as response
    res.json(mergedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSubscribedUsers(req, res) {
  try {
    const nonFreeOrStudentUsers = await prisma.user.findMany({
      where: {
        planName: {
          notIn: ["free", "student"],
        },
      },
    });

    const filteredUsers = nonFreeOrStudentUsers.filter((user) => {
      const phoneNumber = user.phoneNumber;
      const startsWithValidDigit = /^[9876]/.test(phoneNumber);
      const allDigitsSame = /^(\d)\1*$/.test(phoneNumber);
      return startsWithValidDigit && !allDigitsSame;
    });

    res.json(filteredUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getModels(req, res) {
  try {
    const models = await prisma.model.findMany();
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSessions(req, res) {
  try {
    const sessions = await prisma.session.findMany();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTopUsers(req, res) {
  try {
    // Fetch the top users with selected fields and order them by session count
    const topUsers = await prisma.user.findMany({
      select: {
        mongoId: true,
        phoneNumber: true,
        planName: true,
        sessions: {
          select: {
            _count: true,
          },
        },
        tokenUsed: true,
      },
      orderBy: {
        sessions: {
          _count: "desc",
        },
      },
    });

    // Filter users on the server side
    const filteredUsers = topUsers.filter((user) => {
      const phoneNumber = user.phoneNumber;
      const startsWithValidDigit = /^[9876]/.test(phoneNumber);
      const allDigitsSame = /^(\d)\1*$/.test(phoneNumber);
      return startsWithValidDigit && !allDigitsSame;
    });

    // Limit the result to the top 10 users after filtering
    const limitedUsers = filteredUsers.slice(0, 10);

    // Format the users for the response
    const formattedUsers = limitedUsers.map((user) => ({
      ...user,
      sessionCount: user.sessions._count,
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMessages(req, res) {
  try {
    const messages = await prisma.message.findMany();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getFeedbacks(req, res) {
  try {
    const feedback = await prisma.feedback.findMany();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Create a new coupon
async function createCoupon(req, res) {
  try {
    const { code, discount, expirationDate } = req.body;
    const newCoupon = new Coupon({ code, discount, expirationDate });
    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Validate a coupon
async function validateCoupon(req, res) {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon)
      return res.status(404).json({ message: "Coupon not found or inactive" });

    if (new Date(coupon.expirationDate) < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    res.status(200).json({ discount: coupon.discount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Deactivate a coupon
async function deactivateCoupon(req, res) {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOneAndUpdate(
      { code },
      { isActive: false },
      { new: true }
    );
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteCoupon(req, res) {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOneAndDelete({ code });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    res.status(200).json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get all coupons
async function allCoupon(req, res) {
  try {
    const coupons = await Coupon.find({});
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// tracking data
async function usertracking(req, res) {
  const { path, visitDuration, userId, visitorId } = req.body;
  try {
    const trackingData = new Tracking({
      path,
      visitDuration,
      userId: userId || null,
      visitorId: visitorId || null,
    });
    await trackingData.save();

    res.status(200).json(trackingData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// User Visit for daily data

async function userdailyvisit(req, res) {
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();

  const dailyData = await Tracking.aggregate([
    { $match: { timestamp: { $gte: startOfDay, $lte: endOfDay } } },
    {
      $group: {
        _id: {
          path: "$path",
          isUser: {
            $cond: { if: { $ne: ["$userId", null] }, then: true, else: false },
          },
        },
        totalVisits: { $sum: 1 },
        totalDuration: { $sum: "$visitDuration" },
      },
    },
    {
      $project: {
        _id: 0,
        path: "$_id.path",
        isUser: "$_id.isUser",
        totalVisits: 1,
        totalDuration: 1,
      },
    },
    {
      $group: {
        _id: "$path",
        visits: {
          $push: {
            isUser: "$isUser",
            totalVisits: "$totalVisits",
            totalDuration: "$totalDuration",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        path: "$_id",
        visits: 1,
      },
    },
  ]);

  res.json(dailyData);
}

// User Visit for monthly data
async function usermonthlyvisit(req, res) {
  const startOfMonth = moment().startOf("month").toDate();
  const endOfMonth = moment().endOf("month").toDate();

  const monthlyData = await Tracking.aggregate([
    { $match: { timestamp: { $gte: startOfMonth, $lte: endOfMonth } } },
    {
      $group: {
        _id: {
          path: "$path",
          isUser: {
            $cond: {
              if: { $ne: ["$userId", null] },
              then: true,
              else: false,
            },
          },
        },
        totalVisits: { $sum: 1 },
        totalDuration: { $sum: "$visitDuration" },
      },
    },
    {
      $project: {
        _id: 0,
        path: "$_id.path",
        isUser: "$_id.isUser",
        totalVisits: 1,
        totalDuration: 1,
      },
    },
    {
      $group: {
        _id: "$path",
        visits: {
          $push: {
            isUser: "$isUser",
            totalVisits: "$totalVisits",
            totalDuration: "$totalDuration",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        path: "$_id",
        visits: 1,
      },
    },
  ]);

  res.json(monthlyData);
}

// User Visit  for yearly data
async function useryearlyvisit(req, res) {
  const startOfYear = moment().startOf("year").toDate();
  const endOfYear = moment().endOf("year").toDate();

  const yearlyData = await Tracking.aggregate([
    { $match: { timestamp: { $gte: startOfYear, $lte: endOfYear } } },
    {
      $group: {
        _id: {
          path: "$path",
          isUser: {
            $cond: {
              if: { $ne: ["$userId", null] },
              then: true,
              else: false,
            },
          },
        },
        totalVisits: { $sum: 1 },
        totalDuration: { $sum: "$visitDuration" },
      },
    },
    {
      $project: {
        _id: 0,
        path: "$_id.path",
        isUser: "$_id.isUser",
        totalVisits: 1,
        totalDuration: 1,
      },
    },
    {
      $group: {
        _id: "$path",
        visits: {
          $push: {
            isUser: "$isUser",
            totalVisits: "$totalVisits",
            totalDuration: "$totalDuration",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        path: "$_id",
        visits: 1,
      },
    },
  ]);

  res.json(yearlyData);
}

module.exports = {
  getReferralCodes,
  getPlans,
  getUsers,
  getSubscribedUsers,
  getModels,
  getSessions,
  getMessages,
  getFeedbacks,
  getTopUsers,
  generateReferralCode,
  createCoupon,
  validateCoupon,
  deactivateCoupon,
  deleteCoupon,
  allCoupon,
  usertracking,
  userdailyvisit,
  usermonthlyvisit,
  useryearlyvisit,
  updateUserPlan,
};
