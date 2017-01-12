const conditionsTemplate = require("./conditions");
const hourlyTemplate = require("./hourly");

module.exports = function weather (conditionsData, forecastData) {
  let conditions = conditionsTemplate(conditionsData);
  let hourly = forecastData.map(hourlyTemplate);

  return ""
    + "<b>Current Conditions</b>"
    + "<br>"
    + conditions
    + "<br>"
    + "<b>Hourly Forecast</b>"
    + "<ul>"
    + hourly.join("")
    + "</ul>"
  ;
};
