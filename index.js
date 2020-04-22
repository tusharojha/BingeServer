// Library Imports
const express = require("express");
const bodyParser = require("body-parser");

// Project Imports
const routes = require("./src/routes");
const database = require("./src/database/connect");
const {PORT} = require("./src/config/config")

const app = express();
app.use(bodyParser.json());

// Connect to database
database.connectDB();

// setup routes for the server
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});
