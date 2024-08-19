const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/user');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const { userId } = jwt.verify(token, process.env.JWT_PASSWORD);
        const user = await User.findByPk(userId)
        if (user) {
            req.user = user;
            next();
        } else {
            throw new Error('User not Found');
        }
    } catch (err) {
        res.status(401).json({
            success: false,
            message: err.message
        });
    }

}