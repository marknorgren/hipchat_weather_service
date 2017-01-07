# weather service


This weather service has a GET and POST route.

The POST route is setup to recieve a POST from a HipChat room integration and responds with the Current Conditions
as well as the Forecast.

## Setup

You will need to get a [Wunderground API Key](https://www.wunderground.com/weather/api/)


## Add your config info

In the config folder add your Wunderground API key, HipChat Room ID, and token to a new file called `development.js`


## To run locally

Run `npm install` to install dependencies

Run `node index.js`. This will start the service locally



## Making the POST request


Replace <HipChat Room ID> with your HipChat Room ID and execute
this curl command:

```
curl -X "POST" "http://localhost:8080/conditions?minneapolis,mn" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d "{\"item\":{\"room\":{\"id\":\"<HipChat Room ID>\"}}}"
```
