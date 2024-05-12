const mongoose = require("mongoose");

module.exports.connect = () => {
  mongoose.connect(process.env.DB_URI, {
    dbName: "SurveyProject",
  });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Database connected");
  });
};
