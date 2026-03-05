const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ ok: true, service: "orbital-mentorship-backend" });
});

module.exports = router;