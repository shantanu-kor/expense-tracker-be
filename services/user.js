exports.getExpenses = (user, conditions) => {
    return user.getExpenses(conditions);
};

exports.saveExpense = async (user, data, conditions) => {
    await user.createSavedExpense(data, conditions);
    return user.getSavedExpenses({ raw: true , attributes: ['expenseUrl']})
};