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
  toggleFavorite,
  deleteNote,
  bulkDeleteNotes,
  deleteNotesByUserId,
} = require("../controllers/note.controller");

// TODO: Re-enable authenticateJwt on all routes when Auth0 login is implemented

// User-scoped routes
router.post("/:userId", createNote);
router.get("/:userId", getNotesByUserId);          // supports ?type=Pre&search=...&sort=az&favorite=true
router.delete("/:userId/all", deleteNotesByUserId);

// Bulk operations (no :userId needed — IDs are in the body)
router.post("/bulk-delete", bulkDeleteNotes);

// Single note routes
router.get("/note/:noteId", getNoteById);
router.patch("/:noteId", updateNote);
router.patch("/:noteId/favorite", toggleFavorite);
router.delete("/:noteId", deleteNote);

module.exports = router;
