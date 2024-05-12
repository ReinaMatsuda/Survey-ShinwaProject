const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserProfile = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    profileDescription: {
      type: String,
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref: "Avatar",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserProfile", UserProfile);
