const mongoose = require("mongoose");
const Answer = require("./answer");
const User = require("./user");
const Category = require("./categories");

const Schema = mongoose.Schema;

const SurveySchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    singleChoiceQuestion: [
      {
        questionText: { type: String },
        options: [{ opName: { type: String } }],
      },
    ],
    multipleChoiceQuestion: [
      {
        questionText: { type: String },
        options: [{ opName: { type: String } }],
      },
    ],
    openEndedQuestion: [
      {
        questionText: { type: String },
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    answers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SurveySchema.post(
  "findOneAndDelete",
  async function (doc) {
    if (doc) {
      await Answer.deleteMany({
        _id: {
          $in: doc.answers,
        },
      });

      await User.updateMany(
        { userSurveys: doc._id },
        { $pull: { userSurveys: doc._id } }
      );

      await User.updateMany(
        { userAnswers: { $in: doc.answers } },
        { $pull: { userAnswers: { $in: doc.answers } } }
      );

      await Category.updateMany(
        { name: doc.category },
        { $pull: { surveys: doc._id } }
      );
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Survey", SurveySchema);
