// Library Imports
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");

// Project Imports
const routes = require("./src/routes");
const database = require("./src/database/connect");
const { PORT } = require("./src/config/config");
const { connectSockets } = require("./src/sockets/socket");

const app = express();
var server = http.createServer(app);

connectSockets(server);

app.use(bodyParser.json());

// Connect to database
database.connectDB();

// setup routes for the server
app.use("/", routes);

server.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});
