const User = require('../models/user');
const Expense = require('../models/expense');
const sequelize = require('../util/database');

exports.getLeaderboard = async (req, res, next) => {
    try {
        // const arr = [];
        // const users = await User.findAll();
        // for (let user of users) {
        //     const name = user.dataValues.name;
        //     // let totalAmount = 0;
        //     const expenses = await user.getExpenses({ raw: true, attributes: [[sequelize.fn('sum', sequelize.col('amount')), 'totalAmount']] });
        //     // for (let i of expenses) {
        //     //     totalAmount += i.amount;
        //     // }
        //     arr.push({ name, totalAmount: expenses[0].totalAmount });
        // }
        // arr.sort((a, b) => b.totalAmount - a.totalAmount);
        
        // const arr = await User.findAll({
        //     attributes: ['name', [sequelize.fn('sum', sequelize.col('expenses.amount')), 'totalAmount']],
        //     include: [
        //         {
        //             model: Expense,
        //             attributes: []
        //         }
        //     ],
        //     group: ['user.id'],
        //     order: [['totalAmount', 'DESC']]
        // })
        const arr = await User.findAll({
            attributes: ['name', 'totalExpense'],
            order: [['totalExpense', 'DESC']]
        })
        res.json({
            success: true,
            data: arr,
            message: "Got user expenses successfully"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};