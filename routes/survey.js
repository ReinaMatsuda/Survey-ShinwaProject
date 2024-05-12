const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  isSurveyAuthor,
  isQuestionAdded,
  isSurveySubmited,
} = require("../middleware");
const surveys = require("../controllers/surveyController");

router.get("/", catchAsync(surveys.index));

//Create Survey
router.get("/new", isLoggedIn, surveys.newSurveyForm);

router.post(
  "/new",
  isLoggedIn,
  isQuestionAdded,
  catchAsync(surveys.createSurvey)
);

router.get("/:id", catchAsync(surveys.showSurvey));

//Submit test
router.post(
  "/:id",
  isLoggedIn,
  isSurveySubmited,
  catchAsync(surveys.submitSurvey)
);

//SURVEY DATA
router.get("/:id/surveydata", catchAsync(surveys.showSurveyData));

router.delete(
  "/:id",
  isLoggedIn,
  isSurveyAuthor,
  catchAsync(surveys.deleteSurvey)
);

module.exports = router;
