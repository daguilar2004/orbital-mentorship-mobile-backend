const mongoose = require("mongoose");

const formattingSchema = new mongoose.Schema(
  {
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    underline: { type: Boolean, default: false },
    fontSize: { type: Number, default: 16 },
    fontColor: { type: String, default: "#000000" },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Pre", "During", "Post", "Daily", "New"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    text: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    formatting: {
      type: formattingSchema,
      default: () => ({
        bold: false,
        italic: false,
        underline: false,
        fontSize: 16,
        fontColor: "#000000",
      }),
    },
    isFavorite: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
