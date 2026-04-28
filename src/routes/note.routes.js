const express = require("express");
const router = express.Router();

// middleware
const { authenticateJwt } = require("../middleware/authenticateJwt");
const { validateObjectId } = require("../middleware/validateObjectId.middleware");

// controller functions
const {
  createNote,
  getNotesByUserId,
  getNoteById,
  updateNote,
  deleteNote,
  deleteNotesByUserId,
  toggleFavorite,
  getFavoriteNotesByUserId,
} = require("../controllers/note.controller");

// TODO: Remove authenticateJwt when real login is implemented
// endpoints
router.post("/:userId", createNote);
router.get("/:userId", getNotesByUserId);
router.get("/:userId/favorites", getFavoriteNotesByUserId);
router.get("/note/:noteId", getNoteById);
router.patch("/:noteId", updateNote);
router.patch("/:noteId/toggle-favorite", toggleFavorite);
router.delete("/:noteId", deleteNote);
router.delete("/:userId/all", deleteNotesByUserId);

module.exports = router;
