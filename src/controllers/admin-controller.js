const mongoose = require('mongoose');
const User = require('../models/user'); // Adjust the path as per your project structure

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
        ...referralCodes.map(code => code.generatedBy.phoneNumber),
        ...referralCodes.map(code => code.redeemedBy?.phoneNumber || ''),
      ]),
    ];

    // Fetch user details from MongoDB
    const users = await User.find({ phoneNumber: { $in: userPhoneNumbers } }, 'phoneNumber');

    // Merge user details with referral codes
    const formattedReferralCodes = referralCodes.map(code => {
      const generatedByUser = users.find(u => u.phoneNumber === code.generatedBy.phoneNumber);
      const redeemedByUser = code.redeemedBy ? users.find(u => u.phoneNumber === code.redeemedBy.phoneNumber) : null;
      return {
        id: code.id,
        redeemed: code.redeemed,
        createdAt: code.createdAt,
        updatedAt: code.updatedAt,
        generatedBy: {
          phoneNumber: code.generatedBy.phoneNumber,
          firstName: generatedByUser?.firstName || '',
          lastName: generatedByUser?.lastName || '',
        },
        redeemedBy: code.redeemedBy
          ? {
              phoneNumber: code.redeemedBy.phoneNumber,
              firstName: redeemedByUser?.firstName || '',
              lastName: redeemedByUser?.lastName || '',
            }
          : null,
      };
    });

    res.json(formattedReferralCodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function getPlans(req, res){
  try {
    const plans = await prisma.plan.findMany();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function getUsers(req, res){
  try {
    const users = await prisma.user.findMany({});

    // Filter users on the server side
    const filteredUsers = users.filter(user => {
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
};

async function getSubscribedUsers(req, res){
  try {
    const nonFreeOrStudentUsers = await prisma.user.findMany({
      where: {
        planName: {
          notIn: ["free", "student"],
        },
      },
    });

    const filteredUsers = nonFreeOrStudentUsers.filter(user => {
      const phoneNumber = user.phoneNumber;
      const startsWithValidDigit = /^[9876]/.test(phoneNumber);
      const allDigitsSame = /^(\d)\1*$/.test(phoneNumber);
      return startsWithValidDigit && !allDigitsSame;
    });

    res.json(filteredUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function getModels(req, res){
  try {
    const models = await prisma.model.findMany();
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function getSessions(req, res){
  try {
    const sessions = await prisma.session.findMany();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
          _count: 'desc',
        },
      },
    });

    // Filter users on the server side
    const filteredUsers = topUsers.filter(user => {
      const phoneNumber = user.phoneNumber;
      const startsWithValidDigit = /^[9876]/.test(phoneNumber);
      const allDigitsSame = /^(\d)\1*$/.test(phoneNumber);
      return startsWithValidDigit && !allDigitsSame;
    });

    // Limit the result to the top 10 users after filtering
    const limitedUsers = filteredUsers.slice(0, 10);

    // Format the users for the response
    const formattedUsers = limitedUsers.map(user => ({
      ...user,
      sessionCount: user.sessions._count,
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function getMessages(req, res){
  try {
    const messages = await prisma.message.findMany();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function getFeedbacks(req, res){
  try {
    const feedback = await prisma.feedback.findMany();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  
module.exports = {
  getReferralCodes,
  getPlans,
  getUsers,
  getSubscribedUsers,
  getModels,
  getSessions,
  getMessages,
  getFeedbacks,
  getTopUsers
}