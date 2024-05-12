const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema(
  {
    surveyId: {
      type: String,
      required: true,
    },
    singleChoiceAnswers: [
      {
        questionId: { type: String },
        selectedOptionId: { type: String },
      },
    ],
    openEndedAnswers: [
      {
        questionId: { type: String },
        answerText: { type: String },
      },
    ],
    multipleChoiceAnswers: [
      {
        questionId: { type: String },
        selectedOptionId: [{ type: String }],
      },
    ],
    solverUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Answer", answerSchema);
