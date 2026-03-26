const mongoose = require("mongoose");

module.exports = async function connectDB(uri) {
  if (!uri) throw new Error("MONGODB_URI missing");

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");
};