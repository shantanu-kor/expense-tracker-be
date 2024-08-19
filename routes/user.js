const express = require('express');

const userController = require('../controllers/user');

const authenticationMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/add-user', userController.addUser);

router.post('/login-user', userController.loginUser);

router.get('/is-premium', authenticationMiddleware.authenticate, userController.isPremium);

module.exports = router;