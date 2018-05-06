module.exports = function hourly (forecast) {
  return `
    <li>
      ${forecast.time} <br>
      ${forecast.condition} <br>
      <b>${forecast.temp}˚F</b>, Feels Like: ${forecast.feelsLike}˚F <br>
      Wind: ${forecast.wind}mph, PoP: ${forecast.pop}% <br>
    </li>
  `;
};
