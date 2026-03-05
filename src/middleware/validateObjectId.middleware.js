const mongoose = require("mongoose");

exports.validateObjectIdParam = (paramName) => (req, res, next) => {
  const val = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(val)) {
    return res.status(400).json({ error: `Invalid ObjectId: ${paramName}` });
  }
  next();
};