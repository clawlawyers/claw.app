const { listCollections, getCollectionSchema } = require('../utils/common/collections'); // Import collection utility functions

async function getReferralCodes(req, res){
  try {
    const referralCodes = await prisma.referralCode.findMany();
    res.json(referralCodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
    res.json(users);
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
    res.json(nonFreeOrStudentUsers);
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

async function getTopUsers(req, res){
  try {
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
      },
      orderBy: {
        sessions: {
          _count: 'desc',
        },
      },
      take: 10, // Limit the result to 7 users
    });

    const formattedUsers = topUsers.map(user => ({
      ...user,
      sessionCount: user.sessions._count,
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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