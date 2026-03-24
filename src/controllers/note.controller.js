const Note = require("../models/note.model");
const mongoose = require("mongoose");

const createNote = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, title, text, formatting } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!type || !title || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const note = new Note({
      userId,
      type,
      title,
      text,
      formatting,
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Failed to create note:", error);
    res.status(500).json({ message: "Failed to create note" });
  }
};

const getNotesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const notes = await Note.find({ userId }).sort({ createdAt: -1 });
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

    const note = await Note.findById(noteId);

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
    const { type, title, text, formatting } = req.body;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findByIdAndUpdate(
      noteId,
      {
        type,
        title,
        text,
        formatting,
        updatedAt: new Date(),
      },
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

const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Failed to delete note:", error);
    res.status(500).json({ message: "Failed to delete note" });
  }
};

const deleteNotesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await Note.deleteMany({ userId });

    res.status(200).json({
      message: "Notes deleted successfully",
      deletedCount: result.deletedCount,
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
  deleteNote,
  deleteNotesByUserId,
};
