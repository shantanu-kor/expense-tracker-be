const express = require('express');

const premiumController = require('../controllers/premium');

const premiumMiddleware = require('../middleware/premiumUser');
const authenticationMiddleware = require('../middleware/auth');


const router = express.Router();

router.get('/get-leaderboard', authenticationMiddleware.authenticate, premiumMiddleware.isPremiumUser, premiumController.getLeaderboard);

module.exports = router;