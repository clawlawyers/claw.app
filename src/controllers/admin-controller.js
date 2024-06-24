const mongoose = require("mongoose");
const { GptServices, ClientService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user"); // Adjust the path as per your project structure
const Coupon = require("../models/coupon");

async function generateReferralCode(req, res) {
  try {
    const { _id, firstName, lastName, collegeName } = req.body.client;

    const updatedClient = await ClientService.updateClient(_id, {
      firstName,
      lastName,
      collegeName,
      ambassador: true,
    });

    console.log(updatedClient);

    const referralCodeExist = await GptServices.CheckReferralCodeExistToUser(
      _id
    );

    console.log(referralCodeExist);

    if (GptServices.CheckReferralCodeExistToUser(_id)) {
      return res.status(StatusCodes.OK).json(
        SuccessResponse({
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

    const userPhoneNumbers = [
      ...new Set([
        ...referralCodes.map((code) => code.generatedBy.phoneNumber),
        ...referralCodes.map((code) => code.redeemedBy?.phoneNumber || ""),
      ]),
    ];

    // Fetch user details from MongoDB
    const users = await User.find(
      { phoneNumber: { $in: userPhoneNumbers } },
      "phoneNumber"
    );

    // Merge user details with referral codes
    const formattedReferralCodes = referralCodes.map((code) => {
      const generatedByUser = users.find(
        (u) => u.phoneNumber === code.generatedBy.phoneNumber
      );
      const redeemedByUser = code.redeemedBy
        ? users.find((u) => u.phoneNumber === code.redeemedBy.phoneNumber)
        : null;
      return {
        id: code.id,
        redeemed: code.redeemed,
        createdAt: code.createdAt,
        updatedAt: code.updatedAt,
        generatedBy: {
          phoneNumber: code.generatedBy.phoneNumber,
          firstName: generatedByUser?.firstName || "",
          lastName: generatedByUser?.lastName || "",
        },
        redeemedBy: code.redeemedBy
          ? {
              phoneNumber: code.redeemedBy.phoneNumber,
              firstName: redeemedByUser?.firstName || "",
              lastName: redeemedByUser?.lastName || "",
            }
          : null,
      };
    });

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

    // Send the filtered users as response
    res.json(filteredUsers);
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
};
