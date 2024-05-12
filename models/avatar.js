const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const avatarSchema = new Schema({
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Avatar", avatarSchema);
