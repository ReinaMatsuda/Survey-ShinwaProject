const Survey = require("./models/survey");
const UserProfile = require("./models/userProfile");
const Answer = require("./models/answer");

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; //
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
};

module.exports.isSurveyAuthor = async (req, res, next) => {
  const { id } = req.params;
  const survey = await Survey.findById(id);
  if (!survey.author.equals(req.user._id)) {
    req.flash("error", "You do not have premission to do that! ");
    return res.redirect(`/surveys/${id}`);
  }
  next();
};

module.exports.isProfileAuthor = async (req, res, next) => {
  const { id } = req.params;
  const profile = await UserProfile.findById(id);
  if (!profile.user._id.equals(req.user.id)) {
    req.flash("error", "You do not have premission to do that! ");
    return res.redirect(`/user/${id}/profile`);
  }
  next();
};

module.exports.isQuestionAdded = async (req, res, next) => {
  if (
    !(
      req.body.singleChoiceQuestion ||
      req.body.multipleChoiceQuestion ||
      req.body.openEndedQuestion
    )
  ) {
    req.flash("error", "Please add a question");
    return res.redirect("/surveys");
  }
  next();
};

module.exports.isSurveySubmited = async (req, res, next) => {
  const answer = await Answer.find({
    surveyId: req.params.id,
    solverUserId: req.user.id,
  });
  if (answer[0]) {
    req.flash("error", "You have already submitted this survey");
    return res.redirect("/surveys");
  }
  console.log(answer);
  next();
};
