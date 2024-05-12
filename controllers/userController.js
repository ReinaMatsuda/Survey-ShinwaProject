const Survey = require("../models/survey");
const Answer = require("../models/answer");
const User = require("../models/user");
const Avatar = require("../models/avatar");
const UserProfile = require("../models/userProfile");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

//REGISTER

module.exports.registerPage = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const profile = new UserProfile({
      user,
      profilePicture: "",
      profileDescription: "Profile description not provided yet.",
    });
    user.profile = profile;
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Survey App");
      res.redirect("/");
    });
    await profile.save();
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

//LOGIN and LOGOUT

module.exports.loginPage = (req, res) => {
  res.render("users/login");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome Back!");
  const redirectUrl = res.locals.returnTo || "/";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/");
  });
};

//PROFILE

module.exports.userProfile = async (req, res) => {
  const profile = await UserProfile.findById(req.params.id).populate("avatar");
  const user = await User.findById(profile.user._id);

  const userSurveys = [];
  for (let i = 0; i < user.userSurveys.length; i++) {
    userSurveys.push(await Survey.findById(user.userSurveys[i]._id));
  }
  res.render("users/profile", { user, userSurveys, profile });
};

//PROFILE UPDATE

module.exports.profileEditPage = async (req, res) => {
  const profile = await UserProfile.findById(req.params.id).populate("user");
  res.render("users/profileEdit", { profile });
};

module.exports.profileUpdate = async (req, res) => {
  const { id } = req.params;
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "avatars",
    }
  );
  const avatar = await Avatar({
    user: req.user._id,
    url: result.secure_url,
  });
  await avatar.save();

  fs.unlinkSync(req.files.image.tempFilePath);
  const profile = await UserProfile.findByIdAndUpdate(id, {
    ...req.body.profile,
    avatar,
  });
  req.flash("success", "Successfully made a Updated Profile!");
  res.redirect(`/user/${profile.id}/profile`);
};
