'use strict';

const http = require('http');
const async = require('async');
const { urlencoded } = require('body-parser');
const express = require('express');
const client = require('request');
const twilio = require('twilio');

// Load configuration from the system environment and commands file
const { 
  IFTTT_KEY, // IFTTT Secret key for webhook requests
  PORT, // The TCP port to run the server on
  TWILIO_AUTH_TOKEN, // Twilio auth token (find at twilio.com/console)
  NODE_ENV, // Setting that indicates whether Node.js is in production/dev mode
  PRODUCTION_URL // The Twilio webhook URL, like https://blah.herokuapp.com/sms
} = process.env;
const COMMANDS = require('./commands');

// Create express app with body parser middleware
const app = express();
app.use(urlencoded({ extended: false }));

// helper function to make a request to IFTTT
function sendEvent(evt, callback) {
  let url = `https://maker.ifttt.com/trigger/${evt}/with/key/${IFTTT_KEY}`;
  client.post(url, callback);
}

// Create route to handle incoming messages from Twilio
app.post('/sms', (request, response) => {
  // Validate that the incoming request is coming from Twilio when running in
  // production
  if (NODE_ENV === 'production') {
    let fromTwilio = twilio.validateExpressRequest(request, TWILIO_AUTH_TOKEN, {
      url: PRODUCTION_URL
    });

    // Only continue with the request if the incoming request is indeed from
    // our Twilio number
    if (!fromTwilio) {
      return response.status(403).send('Unauthorized.');
    } 
  }

  // A TwiML response we will send back to Twilio
  let twiml = new twilio.TwimlResponse();

  // Iterate the list of commands and see which occur in the body of the SMS 
  let eventsToSend = [];
  Object.keys(COMMANDS).forEach((commandName) => {
    if (request.body.Body.indexOf(commandName) > -1) {
      eventsToSend.push((callback) => {
        sendEvent(COMMANDS[commandName], callback);
      });
    }
  });

  // Execute each in series
  async.series(eventsToSend, (err, results) => {
    console.log(results);

    // Determine if any of the event requests failed
    let serviceError = false;
    results.forEach((result) => {
      if (result[0] && result[0].statusCode > 399) {
        serviceError = true;
        return false;
      }
    });

    // Return a feedback message via SMS
    if (err || serviceError) {
      twiml.message('There was a problem sending the event. Please retry.');
    } else {
      twiml.message('Events sent to IFTTT successfully');
    }

    // Render TwiML response to Twilio webhook request
    response.type('text/xml');
    response.send(twiml.toString());
  });
});

// Start the HTTP server
const server = http.createServer(app);
const port = PORT || 3000;
server.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});
