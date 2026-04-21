const User = require("../models/user.model");

module.exports = async function loadUser(req, res, next) {
  try {
    const auth0Id = req.auth.payload.sub;

    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(404).json({ error: "User not registered in system" });
    }

    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};