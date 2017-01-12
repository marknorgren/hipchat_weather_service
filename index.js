/* eslint-disable no-console, prefer-template */
const express = require("express");
const bodyParser = require("body-parser");

const conditionsRoutes = require("./src/routes/conditions");

let app = express();
app.use(bodyParser.json());

app.post("/conditions", conditionsRoutes.post);

app.listen(8080, function () {
  console.log("weather_service app listening on port 8080!");
});
