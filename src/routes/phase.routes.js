const express = require("express");
const router = express.Router();
const Phase = require("../models/phase.model");
const phaseController = require("../controllers/phase.controller");

router.post("/", phaseController.createPhase);
router.put("/:id", phaseController.updatePhase);
// ⭐ ADD THIS
router.get("/mentorship/:mentorshipId", phaseController.getPhasesByMentorship);
router.get("/debug/all", async (req, res) => {
  const phases = await Phase.find();
  res.json(phases);
});
router.delete("/:id", phaseController.deletePhase);
module.exports = router;