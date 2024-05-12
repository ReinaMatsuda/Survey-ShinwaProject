const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
  name: { type: String, required: true },
  surveys: [
    {
      type: Schema.Types.ObjectId,
      ref: "Survey",
    },
  ],
});

module.exports = mongoose.model("Categories", categoriesSchema);
