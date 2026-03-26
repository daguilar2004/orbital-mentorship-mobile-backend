require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 4000;

(async () => {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 orbital-mentorship-mobile-backend running on port ${PORT}`);
  });
})();