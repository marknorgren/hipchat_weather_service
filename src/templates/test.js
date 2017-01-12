const test = require("ava");
const { includes } = require("lodash/collection");

const conditionsTemplate = require("./conditions");
const hourlyTemplate = require("./hourly");

test("Conditions template renders properly", (t) => {
  let conditionsDummyData = {
    temp: 97,
    wind: "10 MPH",
  };

  let output = conditionsTemplate(conditionsDummyData);

  t.truthy(includes(output, "Temp: 97"), "It renders correct temp value");
  t.truthy(includes(output, "Wind: 10 MPH"), "It renders correct wind value");
});

test("Hourly template renders properly", (t) => {
  let hourlyDummyData = {
    time: "12/20/2016",
    temp: 15,
    wind: "43 MPH",
    feelsLike: "Cold",
    pop: "20",
  };

  let output = hourlyTemplate(hourlyDummyData);

  t.truthy(includes(output, "Time: 12/20/2016"), "It renders correct time value");
  t.truthy(includes(output, "Temp: 15"), "It renders correct temp value");
  t.truthy(includes(output, "Wind: 43 MPH"), "It renders correct wind value");
  t.truthy(includes(output, "Feels Like: Cold"), "It renders correct feelsLike value");
  t.truthy(includes(output, "POP: 20%"), "It renders correct pop value");
});
