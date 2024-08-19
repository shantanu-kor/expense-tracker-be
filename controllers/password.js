require('dotenv').config();
const Sib = require('sib-api-v3-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const bcrypt = require('bcrypt');

const rootDir = require('../util/path');

const ForgotPasswordRequest = require('../models/forgotPassword');
const sequelize = require('../util/database');

const User = require('../models/user');

exports.forgotPassword = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { emailId } = req.body;

        const user = await User.findOne({ where: { email: emailId } })
        if (user === null) {
            throw new Error("Email not present");
        }
        const data = await ForgotPasswordRequest.create({ id: uuidv4(), userId: user.id, isActive: true }, { transaction })

        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_SMTP_KEY

        const tranEmailApi = new Sib.TransactionalEmailsApi();

        const sender = {
            email: 'korshantanu@gmail.com',
            name: 'Shantanu Nitin Kor'
        }

        const receivers = [
            {
                email: emailId,
            }
        ];

        const email = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Reset your password',
            htmlContent: `<h1>Reset your password for Daily Expense Tracker</h1><p>Click the link to reset password</p><a href="${process.env.BE_URL}/password/reset-password/${data.id}">Link</a>`
        })
        console.log(email);
        await transaction.commit();
        res.json({
            success: true,
            message: "Email sent successfully"
        })
    } catch (err) {
        console.log(err)
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const uuid = req.params.uuid;
        const request = await ForgotPasswordRequest.findByPk(uuid);
        if (request === null) {
            throw new Error("Request not present");
        }
        if (!request.isActive) {
            throw new Error("Link already used");
        }
        res.sendFile(path.join(rootDir, 'views', 'resetPassword.html'));
    } catch (err) {
        console.log(err);
        res.status(401).json({
            success: false,
            message: err.message
        })
    }
}

exports.saveSentPassword = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const uuid = req.params.uuid;
        const { password } = req.body;
        const request = await ForgotPasswordRequest.findByPk(uuid);
        if (request === null) {
            throw new Error("Incorrect link")
        }
        request.isActive = false;
        await request.save({ transaction });
        const userId = request.userId;
        const user = await User.findByPk(userId);
        if (user === null) {
            throw new Error("User not present");
        }
        const saltRounds = 15;
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            console.log(err);
            if (hash) {
                user.password = hash;
                await user.save({ transaction });
                await transaction.commit();
                res.json({
                    success: true,
                    message: "Password changed"
                })
            }
        })
    } catch (err) {
        console.log(err);
        transaction.rollback();
        res.status(401).json({
            success: false,
            message: err.message
        })
    }
}