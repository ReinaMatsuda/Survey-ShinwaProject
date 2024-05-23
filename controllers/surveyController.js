const Survey = require("../models/survey");
const Answer = require("../models/answer");
const User = require("../models/user");
const Category = require("../models/categories");

const {
  drawSurveySQCCharts,
  drawSurveyMQCCharts,
} = require("../utils/surveyCharts");

module.exports.index = async (req, res) => {
  const surveys = await Survey.find({});
  const categories = await Category.find({});
  res.render("surveys/allSurveys", { surveys, categories });
};

module.exports.newSurveyForm = (req, res) => {
  res.render("surveys/new");
};

module.exports.createSurvey = async (req, res) => {
  const {
    title,
    description,
    singleChoiceQuestion,
    multipleChoiceQuestion,
    openEndedQuestion,
    category,
  } = req.body;

  const allSCQ = [];
  const allMCQ = [];

  for (const q in singleChoiceQuestion) {
    const op = singleChoiceQuestion[q].options.split(", ");

    allSCQ.push({
      questionText: `${singleChoiceQuestion[q].questionText}`,
      options: op.map((e) => {
        return { opName: `${e}` };
      }),
    });
  }
  for (const q in multipleChoiceQuestion) {
    const op = multipleChoiceQuestion[q].options.split(", ");

    allMCQ.push({
      questionText: `${multipleChoiceQuestion[q].questionText}`,
      options: op.map((e) => {
        return { opName: `${e}` };
      }),
    });
  }

  const newSurvey = new Survey({
    title,
    description,
    singleChoiceQuestion: allSCQ,
    multipleChoiceQuestion: allMCQ,
    openEndedQuestion,
    author: req.user._id,
    category,
  });

  const ctgs = await Category.find({});
  const existingCategory = ctgs.find(
    (ctg) => ctg.name.toLowerCase() === category.toLowerCase()
  );

  if (existingCategory) {
    existingCategory.surveys.push(newSurvey);
    await existingCategory.save();
  } else {
    const newCategory = new Category({
      name: category,
      surveys: [newSurvey],
    });
    await newCategory.save();
  }

  const user = await User.findById(req.user.id);
  user.userSurveys.push(newSurvey);
  await user.save();
  await newSurvey.save();

  req.flash("success", "Survey created!");
  res.redirect("/surveys");
};

module.exports.showSurvey = async (req, res) => {
  const survey = await Survey.findById(req.params.id).populate("author");
  if (survey) {
    res.render("surveys/surveyShow", { survey });
  } else {
    res.status(404).send("404 PAGE NOT FOUND");
  }
};

module.exports.submitSurvey = async (req, res) => {
  const survey = await Survey.findById(req.params.id);

  const data = Object.keys(req.body).map((key) => [key, req.body[key]]);
  const singleChoiceAnswers = [];
  const multipleChoiceAnswers = [];
  const openEndedAnswers = [];

  for (let i = 0; i < data.length; i++) {
    if (
      survey.singleChoiceQuestion != [] &&
      survey.singleChoiceQuestion.length - 1 >= i
    ) {
      singleChoiceAnswers.push({
        questionId: data[i][0],
        selectedOptionId: data[i][1],
      });
    } else if (
      survey.multipleChoiceQuestion != [] &&
      i > survey.singleChoiceQuestion.length - 1 &&
      survey.singleChoiceQuestion.length -
        1 +
        survey.multipleChoiceQuestion.length >=
        i
    ) {
      multipleChoiceAnswers.push({
        questionId: data[i][0],
        selectedOptionId: data[i][1],
      });
    } else if (survey.openEndedQuestion != []) {
      openEndedAnswers.push({ questionId: data[i][0], answerText: data[i][1] });
    }
  }

  const newAnswer = Answer({
    surveyId: survey.id,
    singleChoiceAnswers,
    openEndedAnswers,
    multipleChoiceAnswers,
    solverUserId: req.user._id,
  });

  const user = await User.findById(req.user.id);
  user.userAnswers.push(newAnswer);
  survey.answers.push(newAnswer);

  await user.save();
  await survey.save();
  await newAnswer.save();

  req.flash("success", "Submited Thanks");

  res.redirect(`/surveys/${req.params.id}`);
};

module.exports.showSurveyData = async (req, res) => {
  const survey = await Survey.findById(req.params.id).populate("answers");
  if (survey) {
    const dataSC = drawSurveySQCCharts(survey);
    const dataMC = drawSurveyMQCCharts(survey);
    const dataOET = [];

    survey.answers.forEach((answer, index) => {
      const dataOE = [];
      for (let i = 0; i < survey.openEndedQuestion.length; i++) {
        if (
          survey.answers[index].openEndedAnswers[i].questionId ===
          survey.openEndedQuestion[i].id
        ) {
          dataOE.push({
            text: survey.openEndedQuestion[i].questionText,
            answer: survey.answers[index].openEndedAnswers[i].answerText,
          });
        }
      }
      dataOET.push(dataOE);
    });
    const scqaT = [];

    survey.answers.forEach((answer, index) => {
      const scqa = [];
      for (let i = 0; i < survey.singleChoiceQuestion.length; i++) {
        if (
          survey.answers[index].singleChoiceAnswers[i].questionId ===
          survey.singleChoiceQuestion[i].id
        ) {
          scqa.push({
            question: survey.singleChoiceQuestion[i],
            answer: survey.answers[index].singleChoiceAnswers[i],
          });
        }
      }
      scqaT.push(scqa);
    });

    const resultSCT = [];
    scqaT.forEach((scqa) => {
      const resultSC = [];
      scqa.forEach((item) => {
        const { questionText } = item.question;

        const selectedOption = item.question.options.find(
          (option) => option.id === item.answer.selectedOptionId
        );
        if (selectedOption) {
          resultSC.push({ text: questionText, option: selectedOption });
        }
      });
      resultSCT.push(resultSC);
    });

    const mcaT = [];
    survey.answers.forEach((answer, index) => {
      const mca = [];
      for (let i = 0; i < survey.multipleChoiceQuestion.length; i++) {
        if (
          survey.answers[index].multipleChoiceAnswers[i].questionId ===
          survey.multipleChoiceQuestion[i].id
        ) {
          mca.push({
            question: survey.multipleChoiceQuestion[i],
            answer: survey.answers[index].multipleChoiceAnswers[i],
          });
        }
      }
      mcaT.push(mca);
    });

    const resultMCT = [];

    mcaT.forEach((mca) => {
      const resultMC = [];
      mca.forEach((item) => {
        const { questionText, id, options } = item.question;

        item.answer.selectedOptionId.forEach((selectedId) => {
          const selectedOption = options.find(
            (option) => option.id === selectedId
          );
          if (selectedOption) {
            resultMC.push({ text: questionText, option: selectedOption });
          }
        });
      });
      resultMCT.push(resultMC);
    });

    res.render("surveys/surveydata", {
      survey,
      dataSC,
      dataMC,
      dataOET,
      resultSCT,
      resultMCT,
    });
  } else {
    res.status(404).send("404 PAGE NOT FOUND");
  }
};

module.exports.categoryDetails = async (req, res) => {};

module.exports.deleteSurvey = async (req, res) => {
  const { id } = req.params;
  await Survey.findByIdAndDelete(id);
  req.flash("success", "Survey Deleted");
  res.redirect("/surveys");
};
