if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const { connect } = require("./db.js");

//Password user
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

//Flash & Session
const session = require("express-session");
const flash = require("connect-flash");

//UTILS
const ExpressError = require("./utils/ExpressError");

//Routes
const surveysRoutes = require("./routes/survey");
const usersRoutes = require("./routes/users");
const categoriesRoutes = require("./routes/categories.js");
const cloudinary = require("cloudinary").v2;

const fileUpload = require("express-fileupload");

const mongoSanitize = require("express-mongo-sanitize");

connect();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

app.use(fileUpload({ useTempFiles: true }));

const secret = process.env.SECRET || "dev123";
//FLASH config Session
const sessionConfig = {
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

//dogrulama
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//LINKS
app.use("/surveys", surveysRoutes);
app.use("/", usersRoutes);
app.use("/categories", categoriesRoutes);

//Home Page
app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "OH NO, Someting went wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Port 3000");
});
