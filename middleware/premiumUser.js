exports.isPremiumUser = (req, res, next) => {
    if (req.user.dataValues.isPremiumUser) {
        next();
    } else {
        res.status(401).json({
            success: false,
            message: "Not a premium user!"
        })
    }
};