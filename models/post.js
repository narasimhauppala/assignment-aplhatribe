const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema(
  {
    stockSymbol: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 400,
    },
    tags: 
      {
        type: Array,
        required: true,
      },
    description: {
      type: String,
      required: true,
      maxlength: 800,
    },
    likes: [{ type: ObjectId, ref: "User" }],
    comments: [
      {
        comment_text: String,
        postedBy: { type: ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
      },
    ],
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
