const { GptServices, ClientService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const Coupon = require("../models/coupon");
const Tracking = require("../models/tracking");
const moment = require("moment");
const CourtRoomBooking = require("../models/courtRoomBooking");
const CourtroomUser = require("../models/CourtroomUser");
const TrailBooking = require("../models/trailBookingAllow");
const TrailCourtRoomBooking = require("../models/trailCourtRoomBooking");
const TrailCourtroomUser = require("../models/trailCourtRoomUser");
const SpecificLawyerCourtroomUser = require("../models/SpecificLawyerCourtroomUser");
const AdminUser = require("../models/adminUser");
const { createToken, verifyToken } = require("../utils/common/auth");
const TrialCourtroomCoupon = require("../models/trialCourtroomCoupon");

async function deleteTrialCoupon(req, res) {
  try {
    const coupon = data.coupon;
    await TrialCourtroomCoupon.deleteOne(coupon);
    return res
      .status(201)
      .json(SuccessResponse({ status: "coupon deleted sucessfully" }));
  } catch (error) {
    console.log(error);
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
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function getTrialCoupon(req, res) {
  try {
    const coupons = await TrialCourtroomCoupon.find({});
    console.log(coupons);
    return res.status(200).json(SuccessResponse({ coupons }));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error.message));
  }
}

async function getAllAdminNumbers(req, res) {
  try {
    const users = await AdminUser.find({});
    const adminNumbers = users.map((user) => user.phoneNumber);
    console.log(adminNumbers);
    return res.status(200).json(SuccessResponse({ adminNumbers }));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function addNewAdmin(req, res) {
  const { name, phoneNumber } = req.body;
  try {
    const newAdmin = new AdminUser({ name, phoneNumber });
    await newAdmin.save();
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse("Admin added successfully"));
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function verifyAdminUser(req, res) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    const data = verifyToken(token);
    console.log(data);
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
    console.log(error);
    res
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
    console.log(admin);

    const token = createToken({ phoneNumber });

    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ admin, ...token }));
  } catch (error) {
    console.log(error);
    res
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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

    // console.log(booking.courtroomBookings[userIndex]);

    const existingUser = booking.courtroomBookings[userIndex];

    console.log(existingUser);

    // Remove the user from the current slot
    booking.courtroomBookings.splice(userIndex, 1);

    // console.log(booking);

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

    console.log(newBooking);

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

    console.log(newCourtroomUser);

    // Save the new courtroom user
    const savedCourtroomUser = await newCourtroomUser.save();

    console.log(savedCourtroomUser);

    // Add the new booking
    newBooking.courtroomBookings.push(savedCourtroomUser._id);

    // Save the booking
    await newCourtroomUser.save();

    // Save the new booking
    await newBooking.save();

    // Save the updated booking document
    await booking.save();

    res.status(200).send("User slot timing successfully updated.");
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function updateUserDetails(req, res) {
  try {
    const { userId } = req.params;
    const { name, phoneNumber, email, recording } = req.body;

    console.log(req.body);

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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({
      error: "An error occurred while creating the admin and adding the user",
    });
  }
}

async function updateUserPlan(req, res) {
  try {
    let { id, planNames } = req.body;
    const userCurrPlans = await GptServices.getPlansByUserId(id);

    console.log(planNames, userCurrPlans);

    let tempPlanNames = planNames;
    let tempUserCurrPlans = userCurrPlans;

    tempPlanNames = tempPlanNames.filter(
      (plan) => !userCurrPlans.includes(plan)
    );

    tempUserCurrPlans = tempUserCurrPlans.filter(
      (plan) => !planNames.includes(plan)
    );

    console.log(tempPlanNames);
    console.log(tempUserCurrPlans);

    if (tempUserCurrPlans.length > 0) {
      await GptServices.removeUserPlans(id, tempUserCurrPlans);
    }
    if (tempPlanNames.length > 0) {
      await Promise.all(
        tempPlanNames?.map(async (plan) => {
          await GptServices.updateUserPlan(id, plan);
        })
      );
    }

    res.setHeader("Content-Type", "application/json");
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ ...tempPlanNames }));
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

    // console.log(req.body.client);

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

      // console.log(generatedByUser);

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
    // Fetch all users from Prisma
    const users = await prisma.user.findMany({});

    // Filter users on the server side
    const filteredUsers = users.filter((user) => {
      const phoneNumber = user.phoneNumber;
      const startsWithValidDigit = /^[9876]/.test(phoneNumber);
      const allDigitsSame = /^(\d)\1*$/.test(phoneNumber);
      return startsWithValidDigit && !allDigitsSame;
    });

    const MongoUser = await ClientService.getAllClientsDetails();

    const filteredUsersMongo = MongoUser.filter((Muser) => {
      const phoneNumber = Muser.phoneNumber;
      const startsWithValidDigit = /^[9876]/.test(phoneNumber);
      const allDigitsSame = /^(\d)\1*$/.test(phoneNumber);
      return startsWithValidDigit && !allDigitsSame;
    });

    // Fetch all user plans in one call and map them by user ID
    const userPlans = await prisma.userPlan.findMany({
      include: { plan: true },
    });

    const userPlansMap = userPlans.reduce((acc, userPlan) => {
      if (!acc[userPlan.userId]) {
        acc[userPlan.userId] = [];
      }
      acc[userPlan.userId].push(userPlan.plan.name);
      return acc;
    }, {});

    // Merge the filtered users from both MongoDB and Prisma
    const mergedUsers = filteredUsers
      .map((Muser) => {
        const user = filteredUsersMongo.find(
          (user) => user.phoneNumber === Muser.phoneNumber
        );

        if (user) {
          // Fetch the plan names from the userPlansMap
          const planNames = userPlansMap[Muser.mongoId] || [];

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
            planNames, // Use the fetched plan names here
            ambassador: user.ambassador,
            engagementTime: engagementTime,
            firstName: user.firstName,
            lastName: user.lastName,
            collegeName: user.collegeName,
            averageSessionEngagementTime:
              engagementTime?.total / Muser?.numberOfSessions,
          };
        }
      })
      .filter(Boolean); // Remove undefined entries

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

async function allAllowedBooking(req, res) {
  try {
    const allAllowedBookings = await TrailBooking.find({});
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ ...allAllowedBookings }));
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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

    // console.log(booking.courtroomBookings[userIndex]);

    const existingUser = booking.courtroomBookings[userIndex];

    console.log(existingUser);

    // Remove the user from the current slot
    booking.courtroomBookings.splice(userIndex, 1);

    // console.log(booking);

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

    console.log(newBooking);

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

    // // Create a new courtroom user
    // const newCourtroomUser = new TrailCourtRoomBooking({
    //   name: existingUser.name,
    //   phoneNumber: existingUser.phoneNumber,
    //   email: existingUser.email,
    //   password: existingUser.password,
    //   recording: existingUser.recording, // Assuming recording is required and set to true
    //   caseOverview: existingUser.recording,
    // });

    // console.log(newCourtroomUser);

    // // Save the new courtroom user
    // const savedCourtroomUser = await newCourtroomUser.save();

    // console.log(savedCourtroomUser);

    // Add the new booking
    newBooking.courtroomBookings.push(existingUser._id);

    console.log(newBooking);

    // // Save the booking
    // await newCourtroomUser.save();

    // Save the new booking
    await newBooking.save();

    // Save the updated booking document
    await booking.save();

    res.status(200).send("User slot timing successfully updated.");
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
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
  usertracking,
  userdailyvisit,
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
  adminLogin,
  verifyAdminUser,
  getAllAdminNumbers,
  getTrialCoupon,
  createTrialCoupon,
  deleteTrialCoupon,
};
