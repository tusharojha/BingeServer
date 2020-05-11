// Library Imports
var mongoose = require("mongoose");
const { MongoDBUrl } = require("./../config/config");

const connectDB = () => {
  mongoose
    .connect(MongoDBUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => console.log("Connected to MongoDB"));
};

module.exports = { connectDB };
