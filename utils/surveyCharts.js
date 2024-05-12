const survey = require("../models/survey");

module.exports.drawSurveySQCCharts = (survey) => {
  const scqa = [];

  survey.answers.forEach((answer, index) => {
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
  });
  const resultSC = {};
  scqa.forEach((item) => {
    const { questionText, id } = item.question;

    if (!resultSC[id]) {
      resultSC[id] = { questionText, optionCounts: {} };
      item.question.options.forEach((option) => {
        resultSC[id].optionCounts[option.opName] = 0;
      });
    }

    const optionCounts = resultSC[id].optionCounts;

    const selectedOption = item.question.options.find(
      (option) => option.id === item.answer.selectedOptionId
    );
    if (selectedOption) {
      optionCounts[selectedOption.opName]++;
    }
  });

  const arrSC = Object.values(resultSC);

  const formattedDataSC = arrSC.map((item) => {
    const headerRowSC = ["Question", ...Object.keys(item.optionCounts)];
    return [
      headerRowSC,
      [item.questionText, ...Object.values(item.optionCounts)],
    ];
  });

  return formattedDataSC;
};

module.exports.drawSurveyMQCCharts = (survey) => {
  const mca = [];
  survey.answers.forEach((answer, index) => {
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
  });

  const resultMC = {};
  mca.forEach((item) => {
    const { questionText, id, options } = item.question;

    if (!resultMC[id]) {
      resultMC[id] = { questionText, options, optionCounts: {} };
      options.forEach((option) => {
        resultMC[id].optionCounts[option.opName] = 0;
      });
    }

    const optionCounts = resultMC[id].optionCounts;

    item.answer.selectedOptionId.forEach((selectedId) => {
      const selectedOption = options.find((option) => option.id === selectedId);
      if (selectedOption) {
        optionCounts[selectedOption.opName]++;
      }
    });
  });

  const arrMC = Object.values(resultMC);

  const formattedDataMC = arrMC.map((item) => {
    const headerRowMC = ["Question", ...Object.keys(item.optionCounts)];
    return [
      headerRowMC,
      [item.questionText, ...Object.values(item.optionCounts)],
    ];
  });

  return formattedDataMC;
};
