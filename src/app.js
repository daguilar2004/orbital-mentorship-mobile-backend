const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Import routes
const noteRoutes = require("./routes/note.routes");
const userRoutes = require("./routes/user.routes");
const mentorRoutes = require("./routes/mentor.routes");
const menteeRoutes = require("./routes/mentee.routes");
const mentorshipRoutes = require("./routes/mentorship.routes");
const taskRoutes = require("./routes/task.routes");
const healthRoutes = require("./routes/health.routes");
const phaseRoutes = require("./routes/phase.routes");
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "orbital-mentorship-mobile-backend" });
});

// Register routes
app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/mentees", menteeRoutes);
app.use("/api/mentorships", mentorshipRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/phases", phaseRoutes);
module.exports = app;