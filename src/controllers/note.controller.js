const Note = require("../models/note.model");
const mongoose = require("mongoose");

const createNote = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userRole, type, title, sections, formatting } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!userRole || !type || !title || !sections) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const note = new Note({
      userId,
      userRole,
      type,
      title,
      sections,
      formatting,
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Failed to create note:", error);
    res.status(500).json({ message: "Failed to create note" });
  }
};

// GET /api/notes/:userId?type=Pre&search=hello&sort=az&favorite=true
const getNotesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, search, sort, favorite } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const query = { userId, deletedAt: null };

    if (type) {
      const types = type.split(",").map((t) => t.trim());
      query.type = { $in: types };
    }

    if (favorite === "true") {
      query.favorite = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "sections.text": { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === "az") sortOption = { title: 1 };
    if (sort === "za") sortOption = { title: -1 };

    const notes = await Note.find(query).sort(sortOption);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Failed to retrieve notes:", error);
    res.status(500).json({ message: "Failed to retrieve notes" });
  }
};

const getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findOne({ _id: noteId, deletedAt: null });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error("Failed to retrieve note:", error);
    res.status(500).json({ message: "Failed to retrieve note" });
  }
};

const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { type, title, sections, formatting } = req.body;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, deletedAt: null },
      { type, title, sections, formatting },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error("Failed to update note:", error);
    res.status(500).json({ message: "Failed to update note" });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findOne({ _id: noteId, deletedAt: null });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.favorite = !note.favorite;
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    res.status(500).json({ message: "Failed to toggle favorite" });
  }
};

// Soft delete single note
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Failed to delete note:", error);
    res.status(500).json({ message: "Failed to delete note" });
  }
};

// Soft delete multiple notes by array of IDs
// Body: { ids: ["id1", "id2", ...] }
const bulkDeleteNotes = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids must be a non-empty array" });
    }

    const invalidId = ids.find((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidId) {
      return res.status(400).json({ message: `Invalid note ID: ${invalidId}` });
    }

    const result = await Note.updateMany(
      { _id: { $in: ids }, deletedAt: null },
      { deletedAt: new Date() }
    );

    res.status(200).json({
      message: "Notes deleted successfully",
      deletedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Failed to bulk delete notes:", error);
    res.status(500).json({ message: "Failed to bulk delete notes" });
  }
};

// Soft delete all notes for a user
const deleteNotesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await Note.updateMany(
      { userId, deletedAt: null },
      { deletedAt: new Date() }
    );

    res.status(200).json({
      message: "Notes deleted successfully",
      deletedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Failed to delete notes:", error);
    res.status(500).json({ message: "Failed to delete notes" });
  }
};

module.exports = {
  createNote,
  getNotesByUserId,
  getNoteById,
  updateNote,
  toggleFavorite,
  deleteNote,
  bulkDeleteNotes,
  deleteNotesByUserId,
};
