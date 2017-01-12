const url = require("url");

const { fetchForecast, fetchConditions } = require("../api-clients/wunderground");
const { postMessage } = require("../api-clients/hipchat");
const errorTemplate = require("../templates/error");
const weatherTemplate = require("../templates/weather");

function conditionsPostHandler (request, response) {
  let { query } = url.parse(request.url);
  let roomId = request.body.item.room.id;

  Promise.all([fetchConditions(query), fetchForecast(query)])
    .then((results) => handleFetchSuccess(results, roomId), handleFetchFailure)
    .then(() => response.end());
}

function handleFetchSuccess ([conditionsData, forecastData], roomId) {
  let hipchatMessage = weatherTemplate(conditionsData, forecastData);
  let messageData = {
    "message": hipchatMessage,
    "color": "green",
  };

  return postMessage(messageData, roomId);
}

function handleFetchFailure () {
  let hipchatMessage = errorTemplate();

  let messageData = {
    "message": hipchatMessage,
    "color": "red",
  };

  return postMessage(messageData);
}

module.exports = { post: conditionsPostHandler };
