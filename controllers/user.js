const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/user');

function generateAccessToken(id, name) {
    return jwt.sign({userId: id, name: name}, process.env.JWT_PASSWORD)
}

exports.addUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    const saltRounds = 15;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
        console.log(err);
        const findUser = async () => {
            const user = await User.findAll({ where: { email: email.toLowerCase() } })
            // console.log(user);
            if (user.length === 0) return false
            else return true;
        }
        try {
            const exists = await findUser();
            if (!exists) {
                const user = await User.create({ name, email: email.toLowerCase(), password: hash });
                res.status(201).json({
                    success: true,
                    message: 'USER_CREATED_SUCCESSFULLY',
                    token: generateAccessToken(user.dataValues.id, user.dataValues.name)
                })
            } else {
                res.status(409).json({
                    success: false,
                    message: 'EMAIL_ALREADY_PRESENT'
                })
            }
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    })
};

exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    const findUser = async () => {
        const user = await User.findAll({ where: { email: email.toLowerCase() } })
        if (user.length === 0) return null;
        else return user[0];
    }
    try {
        const exists = await findUser();
        if (!exists) {
            res.status(404).json({
                success: false,
                message: "User not found"
            })
        } else {
            bcrypt.compare(password, exists.dataValues.password, (err, result) => {
                if (err) {
                    throw new Error('Something went wrong')
                }
                if(result === true) {
                    res.json({
                        success: true,
                        message: "User login successful",
                        token: generateAccessToken(exists.dataValues.id, exists.dataValues.name)
                    })
                } else {
                    res.status(401).json({
                        success: false,
                        message: "User not authorized (Incorrect Password)"
                    })
                }
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.isPremium = (req, res, next) => {
    if (req.user.dataValues.isPremiumUser) {
        res.json({
            success: true,
            message: "User is a premium user"
        })
    } else {
        res.json({
            success: false,
            message: "User is not a premium user"
        })
    }
}