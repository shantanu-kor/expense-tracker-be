const Expense = require('../models/expense');
const sequelize = require('../util/database');

const UserServices = require('../services/user');
const S3Services = require('../services/s3');

exports.addExpense = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    const { amount, description, category, date } = req.body;
    try {
        const expense = await req.user.createExpense({ amount, description, category, date }, { transaction });
        req.user.totalExpense += Number(amount);
        await req.user.save({ transaction });
        await transaction.commit();
        const id = expense.id;
        res.status(201).json({
            success: true,
            message: "Expense Added Successfully",
            data: { amount, description, category, date, id }
        });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getExpenses = async (req, res, next) => {
    try {
        const page = req.query.page;
        const limit = Number(req.query.limit);
        if (!page) {
            throw new Error("Page no. not found");
        }
        const data = await UserServices.getExpenses(req.user, { raw: true, limit, offset: (page - 1) * limit, attributes: ['amount', 'description', 'category', 'date', 'id'] });
        res.json({
            success: true,
            message: "All your expenses",
            data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};

exports.deleteExpense = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    const id = req.params.id;
    try {
        const data = await UserServices.getExpenses(req.user, { where: { id }, transaction })
        const expense = data[0].amount;
        await data[0].destroy({ transaction });
        req.user.totalExpense -= expense;
        await req.user.save({ transaction });
        await transaction.commit();
        res.json({
            success: true,
            message: "Expense deleted successfully"
        })
    } catch (err) {
        transaction.rollback();
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};

exports.downloadExpenses = async (req, res, next) => {
    try {
        const expenses = await UserServices.getExpenses(req.user, { raw: true });
        const stringifiedExpenses = JSON.stringify(expenses);
        const fileName = `${req.user.email}/${new Date()}_Expenses.txt`;
        const fileUrl = await S3Services.uploadToS3(stringifiedExpenses, fileName);
        const expenseUrls = await UserServices.saveExpense(req.user, { expenseUrl: fileUrl });
        res.status(200).json({ expenseUrls, fileUrl, success: true })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};

exports.getMaxPage = async (req, res, next) => {
    try {
        const count = await req.user.countExpenses();
        res.json({ success: true, count })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}