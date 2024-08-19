const express = require('express');

const passwordController = require('../controllers/password');
const authenticationMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/forgot-password', authenticationMiddleware.authenticate, passwordController.forgotPassword);

router.get('/reset-password/:uuid', passwordController.resetPassword);

router.post('/send-password/:uuid', passwordController.saveSentPassword);

module.exports = router;