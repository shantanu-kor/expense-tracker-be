const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const SavedExpense = sequelize.define('savedExpense', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    expenseUrl: {
        type: Sequelize.STRING(1024),
        allowNull: false,
    }
})

module.exports = SavedExpense;