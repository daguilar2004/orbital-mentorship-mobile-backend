const mongoose = require("mongoose");

module.exports = async function connectDB(uri) {
  const dbUri = uri || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/orbital-mentorship";

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(dbUri);
    console.log("✅ Connected to MongoDB", dbUri);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Please make sure MongoDB is running and accessible.");
    console.error("If you are using local MongoDB, run:");
    console.error("  sudo systemctl start mongod");
    console.error("or with Docker:");
    console.error("  docker run -d -p 27017:27017 --name mongo mongo:7");
    console.error("Or set MONGODB_URI in .env to a valid MongoDB URI.");
    throw error;
  }
};