const mongoose = require("mongoose");

const formattingSchema = new mongoose.Schema(
  {
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    underline: { type: Boolean, default: false },
    fontSize: { type: Number, default: 16, min: 10, max: 32 },
    fontColor: { type: String, default: "#000000" },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    text: { type: String, default: "" },
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
    userRole: {
      type: String,
      enum: ["mentor", "mentee"],
      required: true,
    },
    type: {
      type: String,
      enum: ["Pre", "During", "Post", "Daily", "New"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    sections: {
      type: [sectionSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "sections must have at least one entry",
      },
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
    favorite: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes
noteSchema.index({ userId: 1, deletedAt: 1, createdAt: -1 });
noteSchema.index({ userId: 1, type: 1, deletedAt: 1 });
noteSchema.index({ userId: 1, favorite: 1, deletedAt: 1, createdAt: -1 });
noteSchema.index({ title: "text", "sections.text": "text" });

module.exports = mongoose.model("Note", noteSchema);
