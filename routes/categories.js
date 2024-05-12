const express = require("express");
const router = express.Router();
const Category = require("../models/categories");
const Survey = require("../models/survey");
const catchAsync = require("../utils/catchAsync");

router.get(
  "/:category",
  catchAsync(async (req, res) => {
    const surveys = await Survey.find({ category: req.params.category });
    res.render("categories/categoryDetails", { surveys });
  })
);

module.exports = router;
