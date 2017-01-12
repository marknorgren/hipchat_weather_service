module.exports = function hourly (forecast) {
  return `
    <li>
      Time: ${forecast.time} <br>
      Temp: ${forecast.temp}˚F <br>
      Feels Like: ${forecast.feelsLike}˚F <br>
      Wind: ${forecast.wind}mph <br>
      POP: ${forecast.pop}% <br>
    </li>
  `;
};
