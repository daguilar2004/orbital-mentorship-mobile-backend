const mongoose = require('mongoose');
const Mentorship = require("../models/mentorship.model");

const router = require("express").Router();
const mentorshipController = require("../controllers/mentorship.controller");
const { validateObjectIdParam } = require("../middleware/validateObjectId.middleware");

router.get("/:id", validateObjectIdParam("id"), mentorshipController.getMentorship);
router.get("/:id/tasks", mentorshipController.getMentorshipTasks);
router.post("/seed", async (req, res) => {
  const Mentorship = require("../models/mentorship.model");

  const m = await Mentorship.create({
    menteeId: new mongoose.Types.ObjectId(),
    mentorId: new mongoose.Types.ObjectId(),
  });

  res.json(m);
});

module.exports = router;
