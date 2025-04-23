const { GptServices, ClientService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const Coupon = require("../models/coupon");
const Tracking = require("../models/tracking");
const Navigation = require("../models/navigation");
const moment = require("moment");
const CourtRoomBooking = require("../models/courtRoomBooking");
const CourtroomUser = require("../models/CourtroomUser");
const TrailBooking = require("../models/trailBookingAllow");
const TrailCourtRoomBooking = require("../models/trailCourtRoomBooking");
const TrailCourtroomUser = require("../models/trailCourtRoomUser");
const { Client } = require("../models");
const SpecificLawyerCourtroomUser = require("../models/SpecificLawyerCourtroomUser");
const AdminUser = require("../models/adminUser");
const { createToken, verifyToken } = require("../utils/common/auth");
const TrialCourtroomCoupon = require("../models/trialCourtroomCoupon");
const prisma = require("../config/prisma-client");
const { createNewUser } = require("../services/common-service");
const ClientAdiraUser = require("../models/cleintAdiraUser");
const { sendConfirmationEmailForAmbas } = require("../utils/common/sendEmail");
const { hashPassword } = require("../utils/coutroom/auth");

async function sessionHistory(req, res) {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.params.userId;

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

    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ sessionMessages }));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function totalSessions(req, res) {
  try {
    const userId = req.params.userId;
    const SessionList = await prisma.session.findMany({
      where: {
        userId: userId,
        modelName: "legalGPT",
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
    return res.status(StatusCodes.OK).json(SuccessResponse({ SessionList }));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function getFeedback(req, res) {
  try {
    const allFeedback = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            mongoId: true,
            phoneNumber: true,
            createdAt: true,
            updatedAt: true,
            // Add any other user fields you need
          },
        },
        message: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            updatedAt: true,
            // Add any other message fields you need
          },
        },
      },
    });

    // Transform the response to include user and message details
    const feedbackWithDetails = allFeedback.map((feedback) => ({
      id: feedback.id,
      impression: feedback.impression,
      feedbackType: feedback.feedbackType,
      feedbackMessage: feedback.feedbackMessage,
      createdAt: feedback.createdAt,
      phoneNumber: feedback.user.phoneNumber, // User details
      Response: feedback.message.text, // Message details
    }));

    return res.status(200).json(SuccessResponse({ feedbackWithDetails }));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function userPlanDist(req, res) {
  try {
    const totalActiveUserPlan = await prisma.userAdiraPlan.findMany({
      where: {
        isActive: true,
      },
      select: {
        planName: true,
      },
    });

    // Group the plan names and count occurrences
    const groupedPlans = totalActiveUserPlan.reduce((acc, plan) => {
      acc[plan.planName] = (acc[plan.planName] || 0) + 1;
      return acc;
    }, {});

    // Convert the grouped plans into the desired format with planName as name
    const data = Object.keys(groupedPlans).map((planName) => ({
      name: planName,
      value: groupedPlans[planName],
    }));

    return res.status(201).json(SuccessResponse({ data: data }));
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function deleteTrialCoupon(req, res) {
  try {
    const { id } = req.body;
    await TrialCourtroomCoupon.deleteOne(coupon);
    return res
      .status(201)
      .json(SuccessResponse({ status: "coupon deleted sucessfully" }));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function createTrialCoupon(req, res) {
  try {
    const { CouponCode, StartDate, EndDate, totalSlots, bookedSlots } =
      req.body;
    const newCoupon = new TrialCourtroomCoupon({
      CouponCode,
      StartDate,
      EndDate,
      totalSlots,
      bookedSlots,
    });
    await newCoupon.save();
    return res.status(201).json(SuccessResponse({ coupon: newCoupon }));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function getTrialCoupon(req, res) {
  try {
    const coupons = await TrialCourtroomCoupon.find({});
    return res.status(200).json(SuccessResponse({ coupons }));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function getAllAdminNumbers(req, res) {
  try {
    const users = await AdminUser.find({});
    const adminNumbers = users.map((user) => user.phoneNumber);
    return res.status(200).json(SuccessResponse({ users }));
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function addNewAdmin(req, res) {
  const { name, phoneNumber } = req.body;
  try {
    const existing = await AdminUser.findOne({ phoneNumber: phoneNumber });
    if (existing) {
      return res.status(400).json(SuccessResponse("Admin already exists"));
    }
    const newAdmin = new AdminUser({ name, phoneNumber });
    await newAdmin.save();
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse("Admin added successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function deleteAdmin(req, res) {
  const { phoneNumber } = req.body;
  try {
    const existing = await AdminUser.findByIdAndDelete(phoneNumber);
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse("Admin deleted successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function verifyAdminUser(req, res) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    const data = verifyToken(token);
    const phoneNumber = data.phoneNumber;
    const admin = await AdminUser.findOne({ phoneNumber });
    if (!admin) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ErrorResponse("Admin not found"));
    }
    const newtoken = createToken({ phoneNumber });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ admin, ...newtoken }));
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function adminLogin(req, res) {
  try {
    const { phoneNumber } = req.body;
    const admin = await AdminUser.findOne({ phoneNumber });
    if (!admin) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ErrorResponse("Admin not found"));
    }
    const token = createToken({ phoneNumber });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ admin, ...token }));
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({ ...error.message }, error));
  }
}

async function deleteClientCourtroomBookings(req, res) {
  try {
    const { _id } = req.body;
    await SpecificLawyerCourtroomUser.findByIdAndDelete(_id);
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse("Client courtroom bookings deleted successfully"));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function getClientCourtroomBookings(req, res) {
  try {
    const clientUsers = await SpecificLawyerCourtroomUser.find({});
    return res.status(StatusCodes.OK).json(SuccessResponse(clientUsers));
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).j;
  }
}

async function updateClientCourtroomBooking(req, res) {
  try {
    const { updatedData } = req.body;
    const clientUser = await SpecificLawyerCourtroomUser.findOneAndUpdate(
      {
        Domain: updatedData.Domain,
      },
      {
        ...updatedData,
      },
      {
        new: true,
      }
    );
    return res.status(StatusCodes.OK).json(SuccessResponse(clientUser));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function updateUserTiming(req, res) {
  try {
    const { bookingId, userId } = req.params;
    const { newDate, newHour } = req.body;

    // Validate input
    if (!newDate || newHour === undefined) {
      return res.status(400).send("Missing new date or new hour.");
    }

    // Convert newDate to a Date object
    const newBookingDate = new Date(newDate);

    // Find the booking document by ID
    const booking = await CourtRoomBooking.findById(bookingId).populate(
      "courtroomBookings"
    );

    if (!booking) {
      return res.status(404).send("Booking not found.");
    }

    // Find the user within the courtroomBookings array
    const userIndex = booking.courtroomBookings.findIndex(
      (booking) => booking._id.toString() === userId
    );

    if (userIndex === -1) {
      return res.status(404).send("User not found in this booking.");
    }

    const existingUser = booking.courtroomBookings[userIndex];

    // Remove the user from the current slot
    booking.courtroomBookings.splice(userIndex, 1);

    // Check if the new slot exists for the new date and hour
    let newBooking = await CourtRoomBooking.findOne({
      date: newBookingDate,
      hour: newHour,
    }).populate("courtroomBookings");

    if (!newBooking) {
      // Create a new booking if it doesn't exist
      newBooking = new CourtRoomBooking({
        date: newBookingDate,
        hour: newHour,
        courtroomBookings: [],
      });
    }

    // Check if the total bookings exceed the limit in the new slot
    if (newBooking.courtroomBookings.length >= 4) {
      console.log(
        `Maximum of 4 courtrooms can be booked at ${newHour}:00 on ${newBookingDate.toDateString()}.`
      );
      return res
        .status(400)
        .send(
          `Maximum of 4 courtrooms can be booked at ${newHour}:00 on ${newBookingDate.toDateString()}.`
        );
    }

    // Create a new courtroom user
    const newCourtroomUser = new CourtroomUser({
      name: existingUser.name,
      phoneNumber: existingUser.phoneNumber,
      email: existingUser.email,
      password: existingUser.password,
      recording: existingUser.recording, // Assuming recording is required and set to true
      caseOverview: existingUser.recording,
    });

    // Save the new courtroom user
    const savedCourtroomUser = await newCourtroomUser.save();

    // Add the new booking
    newBooking.courtroomBookings.push(savedCourtroomUser._id);

    // Save the new booking
    await newBooking.save();

    // Save the updated booking document
    await booking.save();

    res.status(200).send("User slot timing successfully updated.");
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function updateUserDetails(req, res) {
  try {
    const { userId } = req.params;
    const { name, phoneNumber, email, recording } = req.body;

    // Validate input
    if (!name && !phoneNumber && !email && !recording) {
      return res.status(400).send("No fields to update.");
    }

    // Find the user document by ID
    const user = await CourtroomUser.findById(userId);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Update the user data
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;
    if (recording) user.recording = recording;

    // Save the updated user document
    await user.save();

    res.status(200).send("User data successfully updated.");
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function deleteBooking(req, res) {
  try {
    const { bookingId, userId } = req.params;

    // Find the booking document by ID
    const booking = await CourtRoomBooking.findById(bookingId).populate(
      "courtroomBookings"
    );

    if (!booking) {
      return res.status(404).send("Booking not found.");
    }

    // Find and remove the user from the courtroomBookings array
    const initialLength = booking.courtroomBookings.length;
    booking.courtroomBookings = booking.courtroomBookings.filter(
      (booking) => booking._id.toString() !== userId
    );

    // Check if a user was actually removed
    if (booking.courtroomBookings.length === initialLength) {
      return res.status(404).send("User not found in this booking.");
    }

    // Save the updated booking document
    await booking.save();
    return res
      .status(StatusCodes.OK)
      .json(
        SuccessResponse({ response: "User successfully removed from booking." })
      );
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function getAllCourtRoomData(req, res) {
  try {
    // Fetch all bookings sorted by date and hour
    const bookings = await CourtRoomBooking.find({})
      .populate("courtroomBookings")
      .sort({ date: 1, hour: 1 });

    // Format dates in the response
    const formattedBookings = bookings.map((booking) => ({
      ...booking.toObject(),
      date: moment(booking.date).format("YYYY-MM-DD"), // Format to YYYY-MM-DD
    }));

    return res.status(StatusCodes.OK).json(SuccessResponse(formattedBookings));
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function removeUserPlan(req, res) {
  try {
    const { userId, planName } = req.body; // plan should be in array format
    const deletePlan = await GptServices.removeUserPlans(userId, planName);
    return res.status(StatusCodes.OK).json(SuccessResponse({ ...deletePlan }));
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while removing user plan" });
  }
}

async function isAdmin(req, res) {
  const { phoneNumber } = req.params;
  try {
    const isAdmin = await GptServices.checkIsAdmin(phoneNumber);

    return res.status(200).json(isAdmin);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while checking admin status" });
  }
}

async function removeAdminUser(req, res) {
  try {
    const { adminId } = req.params;
    const { userId } = req.body;
    const updatedUser = await GptServices.removeAdminUser(adminId, userId);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while removing the user from the admin",
    });
  }
}

async function getAdmins(req, res) {
  try {
    const admins = await GptServices.getAdmins();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching admins" });
  }
}

async function createAdmin(req, res) {
  const { adminId } = req.params;
  const { phoneNumber } = req.body;

  try {
    const updatedUser = await GptServices.createAdmin(adminId, phoneNumber);

    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while adding the user to the admin" });
  }
}

async function addFirstUser(req, res) {
  const { userId } = req.body;

  try {
    responseData = await GptServices.addFirstAdminUser(userId);
    const { updatedUser, newAdmin } = responseData;

    res.status(201).json({ admin: newAdmin, user: updatedUser });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while creating the admin and adding the user",
    });
  }
}

async function updateUserPlan(req, res) {
  try {
    const { id, planName, expiryDate } = req.body;

    // Validate required fields
    if (!id || !planName) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse({}, "User ID and plan name are required"));
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { mongoId: id },
    });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ErrorResponse({}, "User not found"));
    }

    // Check if the plan exists
    const plan = await prisma.allPlan.findUnique({
      where: { name: planName },
    });

    if (!plan) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ErrorResponse({}, "Plan not found"));
    }

    // First, deactivate any existing active plans
    await prisma.userAllPlan.updateMany({
      where: {
        userId: id,
        isActive: true,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    // Create the new plan
    const newUserPlan = await prisma.userAllPlan.create({
      data: {
        userId: id,
        planName: planName,
        isActive: true,
        expiresAt: expiryDate ? new Date(expiryDate) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        message: "User plan updated successfully",
        userPlan: newUserPlan,
      })
    );
  } catch (error) {
    console.error("Error updating user plan:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function generateReferralCode(req, res) {
  try {
    const { _id, firstName, lastName, collegeName } = req.body.client;

    const updatedClient = await ClientService.updateClient(_id, {
      firstName,
      lastName,
      collegeName,
      ambassador: true,
    });

    const referralCodeExist = await GptServices.CheckReferralCodeExistToUser(
      _id
    );

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

    // Map through referral codes and merge user details
    const formattedReferralCodes = referralCodes.map((code) => {
      // Find generatedBy user
      const generatedByUser = users.find(
        (u) => u.phoneNumber === code.generatedBy.phoneNumber
      );

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
        },
        redeemedBy: redeemedByUsers,
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

async function createPlan(req, res) {
  try {
    const {
      name,
      price,
      duration,
      legalGptToken,
      LegalGPTime,
      AdiraToken,
      AdiraTime,
      WarroomToken,
      WarroomTime,
    } = req.body;

    const newPlan = await prisma.allPlan.create({
      data: {
        name,
        price,
        duration,
        legalGptToken,
        LegalGPTime,
        AdiraToken,
        AdiraTime,
        WarroomToken,
        WarroomTime,
      },
    });
    return res.status(StatusCodes.CREATED).json(SuccessResponse({ newPlan }));
  } catch (error) {
    res.status(error.statusCode).json(ErrorResponse({}, error.message));
  }
}

async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortKey = req.query.sortKey || "createdAt";
    const sortDirection = req.query.sortDirection === "desc" ? "desc" : "asc";

    // Define which fields can be sorted in Prisma
    const prismaDirectSortFields = ["createdAt", "updatedAt", "phoneNumber"];

    // Create sort object for Prisma query
    const orderBy = prismaDirectSortFields.includes(sortKey)
      ? { [sortKey]: sortDirection }
      : { createdAt: "desc" }; // default sort

    // Fetch ALL users from Prisma (without pagination)
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { phoneNumber: { startsWith: "6" } },
            { phoneNumber: { startsWith: "7" } },
            { phoneNumber: { startsWith: "8" } },
            { phoneNumber: { startsWith: "9" } },
          ],
        },
        orderBy: prismaDirectSortFields.includes(sortKey) ? orderBy : undefined,
        include: {
          UserAllPlan: {
            where: {
              isActive: true,
            },
            include: {
              plan: true,
            },
          },
        },
      }),
      prisma.user.count({
        where: {
          OR: [
            { phoneNumber: { startsWith: "6" } },
            { phoneNumber: { startsWith: "7" } },
            { phoneNumber: { startsWith: "8" } },
            { phoneNumber: { startsWith: "9" } },
          ],
        },
      }),
    ]);

    // Filter out phone numbers where all digits are the same
    const filteredUsers = users.filter((user) => {
      const phoneNumber = user.phoneNumber;
      return !/^(\d)\1*$/.test(phoneNumber);
    });

    // Fetch corresponding MongoDB users in bulk
    const phoneNumbers = filteredUsers.map((user) => user.phoneNumber);
    const MongoUsers = await ClientService.getClientByPhoneNumbers(
      phoneNumbers
    );

    // Create a map for faster lookups
    const mongoUsersMap = MongoUsers.reduce((acc, user) => {
      acc[user.phoneNumber] = user;
      return acc;
    }, {});

    // Process the data
    let mergedUsers = filteredUsers
      .map((user) => {
        const mongoUser = mongoUsersMap[user.phoneNumber];
        if (!mongoUser) return null;

        const planNames = user.UserAllPlan.map((up) => up.plan.name);

        // Calculate engagement times with proper number conversion
        const calculateEngagementTime = (timeMap) => {
          if (!timeMap || !timeMap.values) return 0;
          return parseFloat(
            Array.from(timeMap.values())
              .reduce((a, b) => a + (typeof b === "number" ? b : 0), 0)
              .toFixed(2)
          );
        };

        // Format engagement time
        const engagementTime = mongoUser?.engagementTime
          ? {
              daily: calculateEngagementTime(mongoUser.engagementTime.daily),
              monthly: calculateEngagementTime(
                mongoUser.engagementTime.monthly
              ),
              yearly: calculateEngagementTime(mongoUser.engagementTime.yearly),
              total: parseFloat(
                (mongoUser.engagementTime.total || 0).toFixed(2)
              ),
            }
          : {
              daily: 0,
              monthly: 0,
              yearly: 0,
              total: 0,
            };

        const adiraEngagement = mongoUser?.spcificEngagementTime?.Adira
          ? {
              daily: calculateEngagementTime(
                mongoUser.spcificEngagementTime.Adira.daily
              ),
              monthly: calculateEngagementTime(
                mongoUser.spcificEngagementTime.Adira.monthly
              ),
              yearly: calculateEngagementTime(
                mongoUser.spcificEngagementTime.Adira.yearly
              ),
              total: parseFloat(
                (mongoUser.spcificEngagementTime.Adira.total || 0).toFixed(2)
              ),
            }
          : {
              daily: 0,
              monthly: 0,
              yearly: 0,
              total: 0,
            };

        const warroomEngagement = mongoUser?.spcificEngagementTime?.Warroom
          ? {
              daily: calculateEngagementTime(
                mongoUser.spcificEngagementTime.Warroom.daily
              ),
              monthly: calculateEngagementTime(
                mongoUser.spcificEngagementTime.Warroom.monthly
              ),
              yearly: calculateEngagementTime(
                mongoUser.spcificEngagementTime.Warroom.yearly
              ),
              total: parseFloat(
                (mongoUser.spcificEngagementTime.Warroom.total || 0).toFixed(2)
              ),
            }
          : {
              daily: 0,
              monthly: 0,
              yearly: 0,
              total: 0,
            };

        const averageSessionEngagementTime =
          user.numberOfSessions > 0
            ? parseFloat(
                (engagementTime.total / user.numberOfSessions).toFixed(2)
              )
            : 0;

        return {
          mongoId: user.mongoId,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          totalTokenUsed: user.totalTokenUsed || 0,
          StateLocation: user.StateLocation || "",
          numberOfSessions: user.numberOfSessions || 0,
          planNames,
          ambassador: mongoUser.ambassador || false,
          engagementTime,
          adiraEngagement,
          warroomEngagement,
          adiraLastPage: mongoUser.spcificEngagementTime?.Adira?.lastPage || "",
          warroomLastPage:
            mongoUser.spcificEngagementTime?.Warroom?.lastPage || "",
          mainWebsite: mongoUser.engagementTime?.lastPage || "",
          firstName: mongoUser.firstName || "",
          lastName: mongoUser.lastName || "",
          collegeName: mongoUser.collegeName || "",
          averageSessionEngagementTime,
        };
      })
      .filter(Boolean);

    // Handle sorting for fields that need to be sorted after data processing
    if (!prismaDirectSortFields.includes(sortKey)) {
      const sortFields = {
        dailyEngagementTime: (user) => user.engagementTime.daily,
        monthlyEngagementTime: (user) => user.engagementTime.monthly,
        totalEngagementTime: (user) => user.engagementTime.total,
        adiraDailyEngagementTime: (user) => user.adiraEngagement.daily,
        warroomDailyEngagementTime: (user) => user.warroomEngagement.daily,
        adiraLastPage: (user) => user.adiraLastPage.toLowerCase(),
        mainWebsite: (user) => user.mainWebsite.toLowerCase(),
        warroomLastPage: (user) => user.warroomLastPage.toLowerCase(),
        averageSessionEngagementTime: (user) =>
          user.averageSessionEngagementTime,
        numberOfSessions: (user) => user.numberOfSessions,
        totalTokenUsed: (user) => user.totalTokenUsed,
      };

      if (sortFields[sortKey]) {
        mergedUsers.sort((a, b) => {
          const aValue = sortFields[sortKey](a);
          const bValue = sortFields[sortKey](b);

          // Handle string comparisons
          if (typeof aValue === "string" && typeof bValue === "string") {
            return sortDirection === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }

          // Handle number comparisons
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        });
      }
    }

    // Apply pagination after sorting
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = mergedUsers.slice(startIndex, endIndex);

    // Send the response with pagination metadata
    res.json({
      users: paginatedUsers,
      pagination: {
        total: mergedUsers.length,
        page,
        limit,
        totalPages: Math.ceil(mergedUsers.length / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSubscribedUsers(req, res) {
  try {
    console.log("Fetching subscribed users...");

    // Get users with different types of plans
    const [usersWithAllPlan, usersWithNewPlan, usersWithAdiraPlan] =
      await Promise.all([
        // All-in-One Plans
        prisma.user.findMany({
          where: {
            UserAllPlan: {
              some: {
                isActive: true,
                NOT: {
                  planName: {
                    in: ["FREE", "ADMIN", "FREE_M"],
                  },
                },
              },
            },
          },
          include: {
            UserAllPlan: {
              where: {
                isActive: true,
                NOT: {
                  planName: {
                    in: ["FREE", "ADMIN", "FREE_M"],
                  },
                },
              },
              include: { plan: true },
            },
          },
        }),

        // New Plans
        prisma.user.findMany({
          where: {
            newplans: {
              some: {
                isActive: true,
                NOT: {
                  planName: {
                    in: ["FREE", "ADMIN", "FREE_M"],
                  },
                },
              },
            },
          },
          include: {
            newplans: {
              where: {
                isActive: true,
              },
              include: { plan: true },
            },
          },
        }),

        // Adira Plans
        prisma.user.findMany({
          where: {
            UserAdiraPlan: {
              some: {
                isActive: true,
                NOT: {
                  planName: {
                    in: ["FREE", "ADMIN", "FREE_M"],
                  },
                },
              },
            },
          },
          include: {
            UserAdiraPlan: {
              where: {
                isActive: true,
              },
              include: { plan: true },
            },
          },
        }),
      ]);

    // Format the response data
    const formattedUsers = [
      ...usersWithAllPlan.map((user) => ({
        userId: user.mongoId,
        phoneNumber: user.phoneNumber,
        email: user.email || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        plans: user.UserAllPlan.map((plan) => ({
          type: "All-in-One",
          planName: plan.planName,
          startDate: plan.createdAt,
          expiryDate: plan.expiresAt,
          isActive: plan.isActive,
          paidPrice: plan.Paidprice,
          usage: {
            legalGpt: {
              used: plan.UsedlegalGptToken,
              total: plan.plan?.legalGptToken || 0,
              time: plan.UsedLegalGPTime,
            },
            adira: {
              used: plan.UsedAdiraToken,
              total: plan.plan?.AdiraToken || 0,
              time: plan.UsedAdiraTime,
            },
            warroom: {
              used: plan.UsedWarroomToken,
              total: plan.plan?.WarroomToken || 0,
              time: plan.UsedWarroomTime,
            },
          },
        })),
      })),

      ...usersWithNewPlan.map((user) => ({
        userId: user.mongoId,
        phoneNumber: user.phoneNumber,
        email: user.email || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        plans: user.newplans.map((plan) => ({
          type: "New Plan",
          planName: plan.planName,
          startDate: plan.createdAt,
          expiryDate: plan.expiresAt,
          isActive: plan.isActive,
          paidPrice: plan.Paidprice,
        })),
      })),

      ...usersWithAdiraPlan.map((user) => ({
        userId: user.mongoId,
        phoneNumber: user.phoneNumber,
        email: user.email || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        plans: user.UserAdiraPlan.map((plan) => ({
          type: "Adira",
          planName: plan.planName,
          startDate: plan.createdAt,
          expiryDate: plan.expiresAt,
          isActive: plan.isActive,
          paidPrice: plan.Paidprice,
          documentsUsed: plan.totalDocumentsUsed || 0,
          totalDocuments: plan.totalDocuments || 0,
        })),
      })),
    ];

    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        users: formattedUsers,
        total: formattedUsers.length,
        breakdown: {
          allInOne: usersWithAllPlan.length,
          newPlan: usersWithNewPlan.length,
          adira: usersWithAdiraPlan.length,
        },
      })
    );
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        ErrorResponse({
          message: "Failed to fetch subscribed users",
          error: error.message,
        })
      );
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
  console.log("hi ");
  try {
    const { code } = req.body;
    console.log(code);

    const coupon = await Coupon.findOneAndUpdate(
      { _id: code },
      { isActive: false }
      // { new: true }
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
    console.log(code);
    console.log("code");
    const coupon = await Coupon.findByIdAndDelete(code);
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

// User navigation tracking
async function trackUserNavigation(req, res) {
  try {
    const {
      userId,
      isAuthenticated,
      sessionId,
      currentPath,
      previousPath,
      timestamp,
      referrer,
      userAgent,
      timeSpentOnPreviousPage,
    } = req.body;

    // Add detailed console logging
    console.log("=== Track Navigation Request Data ===");
    console.log("Full Request Body:", req.body);
    console.log("Detailed Fields:");
    console.log("- userId:", userId);
    console.log("- isAuthenticated:", isAuthenticated);
    console.log("- sessionId:", sessionId);
    console.log("- currentPath:", currentPath);
    console.log("- previousPath:", previousPath);
    console.log("- timestamp:", timestamp);
    console.log("- referrer:", referrer);
    console.log("- userAgent:", userAgent);
    console.log("- timeSpentOnPreviousPage:", timeSpentOnPreviousPage);
    console.log("================================");

    // Validate required fields
    if (!userId || !currentPath || !sessionId) {
      console.log("Validation Failed - Missing Required Fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, currentPath, or sessionId",
      });
    }

    // Create a new navigation record
    const navigationData = new Navigation({
      userId,
      isAuthenticated,
      sessionStartTime: new Date(sessionId),
      navigationStep: {
        path: currentPath,
        previousPath: previousPath || "/",
        timestamp: new Date(timestamp || Date.now()),
      },
      referrer: referrer || "direct",
      userAgent,
      timeSpentOnPreviousPage,
    });

    // Log the created navigation data
    console.log("Created Navigation Data:", navigationData);

    // Save the navigation data
    await navigationData.save();

    res.status(200).json({
      success: true,
      data: navigationData,
    });
  } catch (error) {
    console.error("Track Navigation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
async function userEveryDayData(req, res) {
  var data = [];
  for (var i = 0; i < 7; i++) {
    const startOfDay = moment().subtract(i, "days").startOf("day").toDate();
    const endOfDay = moment().subtract(i, "days").endOf("day").toDate();

    const dailyData = await Tracking.aggregate([
      { $match: { timestamp: { $gte: startOfDay, $lte: endOfDay } } },
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
        $group: {
          _id: "$_id.isUser",
          totalVisits: { $sum: "$totalVisits" },
          totalDuration: { $sum: "$totalDuration" },
        },
      },
    ]);

    data.push({
      date: moment().subtract(i, "days").format("YYYY-MM-DD"),
      registeredUsers: dailyData.find((d) => d._id === true)?.totalVisits || 0,
      visitors: dailyData.find((d) => d._id === false)?.totalVisits || 0,
    });
  }

  return res.status(200).json({
    data: data.reverse(),
    type: "daily",
  });
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
async function userEveryMonthData(req, res) {
  var data = [];
  for (var i = 0; i < 12; i++) {
    const startOfMonth = moment()
      .subtract(i, "months")
      .startOf("month")
      .toDate();
    const endOfMonth = moment().subtract(i, "months").endOf("month").toDate();

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
        $group: {
          _id: "$_id.isUser",
          totalVisits: { $sum: "$totalVisits" },
          totalDuration: { $sum: "$totalDuration" },
        },
      },
    ]);

    data.push({
      month: moment().subtract(i, "months").format("YYYY-MM"),
      registeredUsers:
        monthlyData.find((d) => d._id === true)?.totalVisits || 0,
      visitors: monthlyData.find((d) => d._id === false)?.totalVisits || 0,
    });
  }
  const currentMonthIndex = moment().month();

  // Shuffle the array so that the current month is at index 0
  const shuffledData = [
    ...data.slice(currentMonthIndex - 1),
    ...data.slice(0, currentMonthIndex - 1),
  ];
  res.json(shuffledData);
}

// User Visit  for yearly data
async function useryearlyvisit(req, res) {
  const startOfYear = moment().startOf("year").toDate();
  const endOfYear = moment().endOf("year").toDate();

  const yearlyData = await Tracking.aggregate([
    { $match: { timestamp: { $gte: startOfYear, $lte: endOfYear } } },
    {
      $group: {
        _id: null, // No grouping by user type
        totalVisits: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalVisits: 1,
      },
    },
  ]);

  res.json(yearlyData);
}
async function userEveryYearData(req, res) {
  var data = [];
  for (var i = 0; i < 5; i++) {
    const startOfYear = moment().subtract(i, "years").startOf("year").toDate();
    const endOfYear = moment().subtract(i, "years").endOf("year").toDate();

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
        $group: {
          _id: "$_id.isUser",
          totalVisits: { $sum: "$totalVisits" },
          totalDuration: { $sum: "$totalDuration" },
        },
      },
    ]);

    data.push({
      year: moment().subtract(i, "years").format("YYYY"),
      registeredUsers: yearlyData.find((d) => d._id === true)?.totalVisits || 0,
      visitors: yearlyData.find((d) => d._id === false)?.totalVisits || 0,
    });
  }

  return res.status(200).json({
    data: data.reverse(),
    type: "yearly",
  });
}

async function allAllowedBooking(req, res) {
  try {
    const allAllowedBookings = await TrailBooking.find({});
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ ...allAllowedBookings }));
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while removing user plan" });
  }
}

async function deleteAllowBooking(req, res) {
  try {
    const { id } = req.params;
    const allAllowedBookings = await TrailBooking.findByIdAndDelete(id);
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ data: "deleted successfully " }));
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while removing user plan" });
  }
}

async function updateAllowedBooking(req, res) {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    console.log(req.body);

    // Directly pass the updatedData object to the update operation
    const updatedUserPlan = await TrailBooking.findByIdAndUpdate(
      id,
      updatedData, // Pass updatedData directly
      { new: true } // Option to return the updated document
    );

    // Check if the update was successful
    if (!updatedUserPlan) {
      return res.status(404).json({ error: "User plan not found" });
    }

    return res.status(200).json({ data: updatedUserPlan });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while updating user plan" });
  }
}

async function allowedLogin(req, res) {
  try {
    // Fetch all bookings sorted by date and hour
    const bookings = await TrailCourtRoomBooking.find({})
      .populate("courtroomBookings")
      .sort({ date: 1, hour: 1 });

    // Format dates in the response
    const formattedBookings = bookings.map((booking) => ({
      ...booking.toObject(),
      date: moment(booking.date).format("YYYY-MM-DD"), // Format to YYYY-MM-DD
    }));

    return res.status(StatusCodes.OK).json(SuccessResponse(formattedBookings));
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function deleteAllowedLogin(req, res) {
  try {
    const { bookingId, userId } = req.params;

    // Find the booking document by ID
    const booking = await TrailCourtRoomBooking.findById(bookingId).populate(
      "courtroomBookings"
    );

    if (!booking) {
      return res.status(404).send("Booking not found.");
    }

    // Find and remove the user from the courtroomBookings array
    const initialLength = booking.courtroomBookings.length;
    booking.courtroomBookings = booking.courtroomBookings.filter(
      (booking) => booking._id.toString() !== userId
    );

    // Check if a user was actually removed
    if (booking.courtroomBookings.length === initialLength) {
      return res.status(404).send("User not found in this booking.");
    }

    // Save the updated booking document
    await booking.save();
    return res
      .status(StatusCodes.OK)
      .json(
        SuccessResponse({ response: "User successfully removed from booking." })
      );
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function UpdateUserDetailsAllowedLogin(req, res) {
  try {
    const { userId } = req.params;
    const { name, phoneNumber, email, recording } = req.body;

    console.log(req.body);

    // Validate input
    if (!name && !phoneNumber && !email && !recording) {
      return res.status(400).send("No fields to update.");
    }

    // Find the user document by ID
    const user = await TrailCourtroomUser.findById(userId);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Update the user data
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;
    if (recording) user.recording = recording;

    // Save the updated user document
    await user.save();

    res.status(200).send("User data successfully updated.");
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function UpdateUserTimingAllowedLogin(req, res) {
  try {
    const { bookingId, userId } = req.params;
    const { newDate, newHour } = req.body;

    // Validate input
    if (!newDate || newHour === undefined) {
      return res.status(400).send("Missing new date or new hour.");
    }

    // Convert newDate to a Date object
    const newBookingDate = new Date(newDate);

    // Find the booking document by ID
    const booking = await TrailCourtRoomBooking.findById(bookingId).populate(
      "courtroomBookings"
    );

    if (!booking) {
      return res.status(404).send("Booking not found.");
    }

    // Find the user within the courtroomBookings array
    const userIndex = booking.courtroomBookings.findIndex(
      (booking) => booking._id.toString() === userId
    );

    if (userIndex === -1) {
      return res.status(404).send("User not found in this booking.");
    }

    const existingUser = booking.courtroomBookings[userIndex];

    // Remove the user from the current slot
    booking.courtroomBookings.splice(userIndex, 1);

    // Check if the new slot exists for the new date and hour
    let newBooking = await TrailCourtRoomBooking.findOne({
      date: newBookingDate,
      hour: newHour,
    }).populate("courtroomBookings");

    if (!newBooking) {
      // Create a new booking if it doesn't exist
      newBooking = new TrailCourtRoomBooking({
        date: newBookingDate,
        hour: newHour,
        courtroomBookings: [],
      });
    }

    // Check if the total bookings exceed the limit in the new slot
    if (newBooking.courtroomBookings.length >= 4) {
      console.log(
        `Maximum of 4 courtrooms can be booked at ${newHour}:00 on ${newBookingDate.toDateString()}.`
      );
      return res
        .status(400)
        .send(
          `Maximum of 4 courtrooms can be booked at ${newHour}:00 on ${newBookingDate.toDateString()}.`
        );
    }

    // Add the new booking
    newBooking.courtroomBookings.push(existingUser._id);

    // Save the new booking
    await newBooking.save();

    // Save the updated booking document
    await booking.save();

    res.status(200).send("User slot timing successfully updated.");
  } catch (error) {
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function getallVisitors(req, res) {
  try {
    const page = req.query.page;

    if (page === "everyDayData") {
      var data = [];
      for (var i = 0; i < 7; i++) {
        const startOfDay = moment().subtract(i, "days").startOf("day").toDate();
        const endOfDay = moment().subtract(i, "days").endOf("day").toDate();

        const dailyData = await Tracking.aggregate([
          { $match: { timestamp: { $gte: startOfDay, $lte: endOfDay } } },
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
            $group: {
              _id: "$_id.isUser",
              totalVisits: { $sum: "$totalVisits" },
              totalDuration: { $sum: "$totalDuration" },
            },
          },
        ]);

        data.push({
          date: moment().subtract(i, "days").format("YYYY-MM-DD"),
          registeredUsers:
            dailyData.find((d) => d._id === true)?.totalVisits || 0,
          visitors: dailyData.find((d) => d._id === false)?.totalVisits || 0,
        });
      }

      return res.status(200).json({
        data: data.reverse(),
        type: "daily",
      });
    }

    if (page === "everyMonthData") {
      var data = [];
      for (var i = 0; i < 12; i++) {
        const startOfMonth = moment()
          .subtract(i, "months")
          .startOf("month")
          .toDate();
        const endOfMonth = moment()
          .subtract(i, "months")
          .endOf("month")
          .toDate();

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
            $group: {
              _id: "$_id.isUser",
              totalVisits: { $sum: "$totalVisits" },
              totalDuration: { $sum: "$totalDuration" },
            },
          },
        ]);

        data.push({
          month: moment().subtract(i, "months").format("YYYY-MM"),
          registeredUsers:
            monthlyData.find((d) => d._id === true)?.totalVisits || 0,
          visitors: monthlyData.find((d) => d._id === false)?.totalVisits || 0,
        });
      }

      return res.status(200).json({
        data: data.reverse(),
        type: "monthly",
      });
    }

    if (page === "everyYearData") {
      var data = [];
      for (var i = 0; i < 5; i++) {
        const startOfYear = moment()
          .subtract(i, "years")
          .startOf("year")
          .toDate();
        const endOfYear = moment().subtract(i, "years").endOf("year").toDate();

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
            $group: {
              _id: "$_id.isUser",
              totalVisits: { $sum: "$totalVisits" },
              totalDuration: { $sum: "$totalDuration" },
            },
          },
        ]);

        data.push({
          year: moment().subtract(i, "years").format("YYYY"),
          registeredUsers:
            yearlyData.find((d) => d._id === true)?.totalVisits || 0,
          visitors: yearlyData.find((d) => d._id === false)?.totalVisits || 0,
        });
      }

      return res.status(200).json({
        data: data.reverse(),
        type: "yearly",
      });
    }

    // Default pagination behavior
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit || 0;

    const totalCount = await Tracking.countDocuments();

    const userTrackingData = await Tracking.find({})
      .populate("userId")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return res.status(200).json({
      data: userTrackingData,
      pagination: {
        total: totalCount,
        page: parseInt(page) || 1,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      type: "paginated",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleterefralcode(req, res) {
  try {
    const { id } = req.params;
    const getRefferalCode = await prisma.referralCode.findFirst({
      where: { id: id },
    });
    const deletedCode = await prisma.referralCode.delete({
      where: { referralCode: getRefferalCode.referralCode },
    });
    return res
      .status(200)
      .json({ message: "Referral code deleted successfully", deletedCode });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function removeUser(req, res) {
  console.log("hi");
  try {
    const { id } = req.body;
    console.log(id);
    const deletedCode = await prisma.user.delete({
      where: { mongoId: id },
    });
    res.status(200).json({ message: "removed" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

async function createReferralCodes(req, res) {
  try {
    const { phoneNumber, firstName, lastName, collegeName, email } = req.body;
    const resp = await ClientService.getClientByPhoneNumber(phoneNumber);
    let _id;
    if (resp === null) {
      const resp = await createNewUser(phoneNumber, true);
      _id = resp.mongoId;
    } else {
      _id = resp._id.toString();
    }

    const updatedClient = await ClientService.updateClient(_id, {
      firstName,
      lastName,
      collegeName,
      email,
      ambassador: true,
    });

    const referralCodeExist = await GptServices.CheckReferralCodeExistToUser(
      _id
    );

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

    const createAt = new Date();
    const expiresAt = new Date(createAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    const exitingPlan = await prisma.userAdiraPlan.findMany({
      where: {
        userId: _id,
      },
    });

    if (exitingPlan.length === 0) {
      await prisma.user.update({
        where: {
          mongoId: _id,
        },
        data: {
          isambassadorBenifined: false,
        },
      });
    }

    const checkCodeAlreadyExist = async (rCode) => {
      await GptServices.CheckReferralCodeExist(rCode);
    };

    const rCode = () => {
      return firstName?.substr(0, 3) + Math.floor(100 + Math.random() * 900);
    };

    await sendConfirmationEmailForAmbas(email, firstName + " " + lastName);

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
    return res.status(200).json(
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
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

//  client adira

async function bookClientAdira(req, res) {
  try {
    const { name, phoneNumber, email, Domain, startDate, endDate, totalHours } =
      req.body;

    console.log(req.body);

    // Input validation (basic example, can be extended as per requirements)
    if (
      !name ||
      !phoneNumber ||
      !email ||
      !Domain ||
      !startDate ||
      !endDate ||
      !totalHours
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const respo = await ClientAdiraUser.create({
      name,
      phoneNumber,
      email,
      Domain,
      startDate,
      endDate,
      totalHours,
    });

    res
      .status(201)
      .json({ message: "Adira client booked successfully", respo });
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getUserById(req, res) {
  try {
    const { userId } = req.params;

    // Get user from Prisma DB
    const user = await prisma.user.findUnique({
      where: {
        mongoId: userId,
      },
      include: {
        UserAllPlan: {
          include: {
            plan: true,
          },
        },
        sessions: {
          orderBy: {
            updatedAt: "desc",
          },
          take: 10,
          include: {
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 5,
              select: {
                text: true,
                isUser: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ErrorResponse({}, "User not found"));
    }

    // Get user from MongoDB
    const mongoUser = await Client.findById(userId);

    if (!mongoUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ErrorResponse({}, "User not found in MongoDB"));
    }

    // Calculate engagement times
    const calculateEngagementTime = (timeMap) => {
      if (!timeMap || !timeMap.values) return 0;
      return parseFloat(
        Array.from(timeMap.values())
          .reduce((a, b) => a + (typeof b === "number" ? b : 0), 0)
          .toFixed(2)
      );
    };

    // Format engagement time
    const engagementTime = mongoUser?.engagementTime
      ? {
          daily: calculateEngagementTime(mongoUser.engagementTime.daily),
          monthly: calculateEngagementTime(mongoUser.engagementTime.monthly),
          yearly: calculateEngagementTime(mongoUser.engagementTime.yearly),
          total: parseFloat((mongoUser.engagementTime.total || 0).toFixed(2)),
          lastPage: mongoUser.engagementTime.lastPage || "",
        }
      : {
          daily: 0,
          monthly: 0,
          yearly: 0,
          total: 0,
          lastPage: "",
        };

    // Format platform-specific engagement
    const adiraEngagement = mongoUser?.spcificEngagementTime?.Adira
      ? {
          daily: calculateEngagementTime(
            mongoUser.spcificEngagementTime.Adira.daily
          ),
          monthly: calculateEngagementTime(
            mongoUser.spcificEngagementTime.Adira.monthly
          ),
          yearly: calculateEngagementTime(
            mongoUser.spcificEngagementTime.Adira.yearly
          ),
          total: parseFloat(
            (mongoUser.spcificEngagementTime.Adira.total || 0).toFixed(2)
          ),
          lastPage: mongoUser.spcificEngagementTime.Adira.lastPage || "",
        }
      : {
          daily: 0,
          monthly: 0,
          yearly: 0,
          total: 0,
          lastPage: "",
        };

    const warroomEngagement = mongoUser?.spcificEngagementTime?.Warroom
      ? {
          daily: calculateEngagementTime(
            mongoUser.spcificEngagementTime.Warroom.daily
          ),
          monthly: calculateEngagementTime(
            mongoUser.spcificEngagementTime.Warroom.monthly
          ),
          yearly: calculateEngagementTime(
            mongoUser.spcificEngagementTime.Warroom.yearly
          ),
          total: parseFloat(
            (mongoUser.spcificEngagementTime.Warroom.total || 0).toFixed(2)
          ),
          lastPage: mongoUser.spcificEngagementTime.Warroom.lastPage || "",
        }
      : {
          daily: 0,
          monthly: 0,
          yearly: 0,
          total: 0,
          lastPage: "",
        };

    // Combine all user data
    const userData = {
      id: user.id,
      mongoId: user.mongoId,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      numberOfSessions: user.numberOfSessions || 0,
      totalTokenUsed: user.totalTokenUsed || 0,
      currencyType: user.currencyType,
      plans: user.UserAllPlan.map((up) => ({
        name: up.plan.name,
        isActive: up.isActive,
        createdAt: up.createdAt,
        expiresAt: up.expiresAt,
      })),
      recentSessions: user.sessions.map((session) => ({
        id: session.id,
        name: session.name,
        updatedAt: session.updatedAt,
        recentMessages: session.messages.map((msg) => ({
          text: msg.text,
          isUser: msg.isUser,
          createdAt: msg.createdAt,
        })),
      })),
      personalInfo: {
        firstName: mongoUser.firstName || "",
        lastName: mongoUser.lastName || "",
        email: mongoUser.email || "",
        collegeName: mongoUser.collegeName || "",
        stateLocation: mongoUser.StateLocation || "",
      },
      engagement: {
        overall: engagementTime,
        adira: adiraEngagement,
        warroom: warroomEngagement,
      },
    };

    return res.status(StatusCodes.OK).json(SuccessResponse({ user: userData }));
  } catch (error) {
    console.error("Error in getUserById:", error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
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
  getTopUsers,
  generateReferralCode,
  createCoupon,
  validateCoupon,
  deactivateCoupon,
  deleteCoupon,
  allCoupon,
  usertracking,
  trackUserNavigation,
  userdailyvisit,
  userEveryYearData,
  usermonthlyvisit,
  useryearlyvisit,
  updateUserPlan,
  addFirstUser,
  createAdmin,
  getAdmins,
  removeAdminUser,
  isAdmin,
  removeUserPlan,
  getAllCourtRoomData,
  deleteBooking,
  updateUserDetails,
  updateUserTiming,
  allAllowedBooking,
  deleteAllowBooking,
  updateAllowedBooking,
  allowedLogin,
  deleteAllowedLogin,
  UpdateUserDetailsAllowedLogin,
  UpdateUserTimingAllowedLogin,
  updateClientCourtroomBooking,
  getClientCourtroomBookings,
  deleteClientCourtroomBookings,
  addNewAdmin,
  deleteAdmin,
  adminLogin,
  verifyAdminUser,
  getAllAdminNumbers,
  getTrialCoupon,
  createTrialCoupon,
  deleteTrialCoupon,
  userEveryDayData,
  userEveryMonthData,
  getallVisitors,
  deleterefralcode,
  removeUser,
  createReferralCodes,
  bookClientAdira,
  userPlanDist,
  getFeedback,
  totalSessions,
  sessionHistory,
  createPlan,
  getUserById,
};
