var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var WunderNodeClient = require("wundernode");

var config = require('./config/development');
var URL = require('url');

// Set to true if you want to see all sort of nasty output on stdout.
var debug = false;

// Create Client
var wunder = new WunderNodeClient(config.api, debug, 10, 'minute');

app.use(bodyParser.json());
app.use(function(req, res, next) {
    console.log('\n\nTime:', Date.now());
    console.log('Request Type:', req.method);
    console.log("req url: ", req.url);
    console.log("*******************************\n");
    next();
});

var globalWeatherText = "";
// NOTE: For some reason HipChat is sending the post with a double slash?
app.post('//conditions', function(req, res) {
    globalWeatherText = "";
    console.log('******************* CONDITIONS POST *********************');
    var query = URL.parse(req.url).query;
    console.log('query: ' + query);
    //console.log('body: ', req.body);
    var roomID = req.body.item.room.id;
    var hipChatRoom = HipChatRoomFactory(roomID);
    console.log('roomID: ', roomID);

    function conditionsPromise() {
        return new Promise((resolve, reject) => {
            console.log("conditionsPromise start");
            wunder.conditions(query, function (err, obj) {
                if (err) {
                    console.log('errors: ' + err);
                    reject(err);
                }
                obj = JSON.parse(obj);
                var tempString = obj.current_observation.temperature_string;
                var windString = obj.current_observation.wind_string;
                var weatherText = tempString + "</br> Wind " + windString;
                console.log("tempString, windString, weatherText: ", tempString, windString, weatherText);
                globalWeatherText = "<b>Current Conditions</b></br>" + weatherText + globalWeatherText;

                console.log("conditionsPromise resolve weatherText", weatherText);
                console.log("globalWeatherText: ", globalWeatherText);
                resolve(weatherText);
            });
        })
    };

    function forecastPromise() {
        return new Promise((resolve, reject) => {
            console.log("forecastPromise");
            wunder.hourly(query, function (err, obj) {
                if (err) {
                    console.log('errors: ' + err);
                    reject(err);
                }

                obj = JSON.parse(obj);
                var simpleForecast = obj.hourly_forecast;
                var forecast = "";
                for (i = 0; i < 5; i++) {
                    var forecastHour = simpleForecast[i];
                    console.dir(forecastHour.FCTTIME.pretty);
                    var time = forecastHour.FCTTIME.pretty;
                    var temp = "&emsp;Temp: " + forecastHour.temp.english + "˚F";
                    var feelsLike = " &emsp;FeelsLike: " + forecastHour.feelslike.english + "˚F";
                    var wind = " &emsp;Wind: " + forecastHour.wspd.english + "mph";
                    var precipChance = "&emsp;POP: " + forecastHour.pop + "%";
                    forecast = forecast + time + "</br>" + temp + "</br>" + feelsLike + "</br>" + wind + "</br>" + precipChance + "</br>"
                };

                if (forecast) {
                    var weatherText = "</br><b>Forecast:</b></br> " + forecast;
                    globalWeatherText = globalWeatherText + weatherText;
                } else {
                    globalWeatherText = globalWeatherText + "Forecast Unavailable";
                }

                console.log("forecastPromise- forecast: ", forecast)
                console.log("forecastPromise resolve");
                resolve(globalWeatherText);
            });
        })
    };

    function sendToHipChatPromiseFunction() {
        return new Promise((resolve, reject) => {
            console.log("*** send to hip chat");
            var messageForHipChatRoom = globalWeatherText;
            console.log("message: ", messageForHipChatRoom);
            var http = require("https");
            var pathOption = '/v2/room/' + hipChatRoom.roomID + '/notification?auth_token=' + hipChatRoom.token
            var options = {
                hostname: 'dtnse1.hipchat.com',
                port: 443,
                path: pathOption,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            var hipChatRequest = http.request(options, function (res) {
                console.log('Status: ' + res.statusCode);
                console.log('Headers: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                resolve(res.statusCode);
                res.on('data', function (body) {
                    console.log('Body: ' + body);
                });
            });
            hipChatRequest.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            // write data to request body
            var weatherText = globalWeatherText;

            var message = {
                "message": weatherText,
                "notify": false,
                "message_format": "html"
            }
            console.log("message: ", message);
            console.log("message", JSON.stringify(message));
            hipChatRequest.write(JSON.stringify(message));
            hipChatRequest.end();
        })
    };

    var promiseArray = [conditionsPromise(), forecastPromise()];
    Promise.all(promiseArray)
        .then(sendToHipChatPromiseFunction)
        .then(function(results) {
            console.log("Results: ", results);
            console.log("DONE DONE DONE");
            console.log("weathertext: ", globalWeatherText);
            res.end(globalWeatherText);
        });
});

app.get('/conditions', function(req, res) {
    var query = URL.parse(req.url).query;
    console.log('query: ' + query);
    wunder.conditions(query, function(err, obj) {
        if (err) {
            console.log('errors: ' + err);
            res.end("Error processing query string:" + queryData.query);
        }

        obj = JSON.parse(obj);
        //console.log('currentObs: ', obj.current_observation);
        //current_observation = obj['current_observation'];//['current_location'];
        var tempString = obj.current_observation.temperature_string;
        var windString = obj.current_observation.wind_string;
        var weatherText = tempString + " Wind " + windString;
        res.json(weatherText);
    });
});

app.get('*', function(req, res) {
    res.send('It works!');
})

app.listen(8080, function() {
    console.log('weather_service app listening on port 8080!');
});

function HipChatRoom() {
    this.roomID = '';
    this.token = '';
}

function HipChatRoomFactory(roomID) {
    console.log("HipChatRoomFactory called: " + roomID);

    var roomConfigKey = "id_" + roomID;
    console.log("roomConfigKey:", roomConfigKey);
    var roomConfig = config[roomConfigKey];

    var hipChatRoom = new HipChatRoom();
    hipChatRoom.roomID = roomConfig.roomID;
    hipChatRoom.token = roomConfig.token;
    return hipChatRoom;
}
