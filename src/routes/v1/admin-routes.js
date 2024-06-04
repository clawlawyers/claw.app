const express = require('express');
const router = express.Router();
const { getReferralCodes, getPlans, getUsers, getSubscribedUsers, getModels, getSessions, getMessages, getFeedbacks, getTopUsers } = require('../../controllers/admin-controller'); 


router.get('/referralcode', getReferralCodes);
router.get('/plan', getPlans);
router.get('/user',getUsers);
router.get('/subscribed-user',getSubscribedUsers)
router.get('/model',getModels)
router.get('/session',getSessions)
router.get('/message',getMessages)
router.get('/feedback',getFeedbacks)
router.get('/topusers',getTopUsers)



module.exports = router;
