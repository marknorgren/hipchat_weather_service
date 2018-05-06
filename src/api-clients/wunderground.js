const WunderNodeClient = require("wundernode");

let config = require("../../config/development");

const DEBUG = false;
let wundergroundApi = new WunderNodeClient(config.wunderground.token, DEBUG, 10, "minute");

function fetchConditions (query) {
  return new Promise((resolve, reject) => {
    wundergroundApi.conditions(query, function (err, response) {
      if (err) {
        return reject(err);
      }

      let responseJson = JSON.parse(response);
      let temp = responseJson.current_observation.temperature_string;
      let wind = responseJson.current_observation.wind_string;

      return resolve({ temp, wind });
    });
  });
}

function fetchForecast (query) {
  return new Promise((resolve, reject) => {
    wundergroundApi.hourly(query, function (err, response) {
      if (err) {
        return reject(err);
      }

      let responseJson = JSON.parse(response);
      //console.log("RESPONSE: ", JSON.stringify(responseJson, null, 2));
      let hourlyForecast = responseJson.hourly_forecast;

      let forecast = hourlyForecast
        .filter((forecast, idx) => idx < 5)
        .map((hour) => ({
          time: hour.FCTTIME.pretty,
          condition: hour.condition,
          temp: hour.temp.english,
          feelsLike: hour.feelslike.english,
          wind: hour.wspd.english,
          pop: hour.pop,
        }));

      return resolve(forecast);
    });
  });
}

module.exports = { fetchConditions, fetchForecast };
