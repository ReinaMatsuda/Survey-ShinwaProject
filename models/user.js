const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
    },
    userSurveys: [
      {
        type: Schema.Types.ObjectId,
        ref: "Survey",
      },
    ],
    userAnswers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(passportLocalMongoose); //bu kullanici adi ve password icin alan ekleyecek

module.exports = mongoose.model("User", UserSchema);
