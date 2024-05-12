const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo, isLoggedIn, isProfileAuthor } = require("../middleware");

const users = require("../controllers/userController");

//register

router.get("/register", users.registerPage);

router.post("/register", catchAsync(users.register));

//login
router.get("/login", users.loginPage);

router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  catchAsync(users.login)
);

//logout
router.get("/logout", users.logout);

//Profile
router.get("/user/:id/profile", catchAsync(users.userProfile));

//Profile Edit
router.get(
  "/user/:id/profile/edit",
  isLoggedIn,
  isProfileAuthor,
  catchAsync(users.profileEditPage)
);

router.put(
  "/user/:id",
  isLoggedIn,
  isProfileAuthor,
  catchAsync(users.profileUpdate)
);

module.exports = router;
