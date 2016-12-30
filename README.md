# Connect SMS to IFTTT

This application scans incoming text messages from a Twilio number looking for
special keywords (commands). These commands are then mapped to IFTTT Maker
events, and sent to IFTTT. By using Twilio directly, you can avoid some of the
SMS channel limitations on IFTTT.

## Before you begin

To make use of this application, you will need a [Twilio account](https://www.twilio.com/)
and some [IFTTT Maker events](https://ifttt.com/maker) set up to do some useful
tasks on your behalf.  From these accounts, you will need:

* Your IFTTT secret key
* Your Twilio auth token (found on [twilio.com/console](https://www.twilio.com/console))

## Configuring the application

Open `commands.js` to find a JavaScript file which maps command words (the
keys of the exported JavaScript object) to corresponding IFTTT events (the 
values of the JavaScript object).  Here is an example `commands.js` which maps
the SMS keyword/command "pizza" to the IFTTT event "order_me_a_pizza".

```js
'use strict';

module.exports = {
  pizza: 'order_me_a_pizza',
};
```

## Deploying the application

No matter how or where you deploy this application, you'll need to configure a 
few [environment variables](https://en.wikipedia.org/wiki/Environment_variable).

| Variable Name | Description |
| `IFTTT_KEY` | The secret key for your IFTTT account |
| `TWILIO_AUTH_TOKEN` | A secret key from your Twilio account, found at [twilio.com/console](https://www.twilio.com/console). Required for securing the SMS feature in production. |
| `NODE_ENV` | Indicates whether the application is in development or production mode - when deploying the app for usage, should be set to `production`. If you are hacking on the app locally, it can be omitted. |
| `PRODUCTION_URL` | The full URL of the Twilio SMS webhook (more on this later). An example URL for a Heroku-hosted app would be `https://flying-elephant-12345.herokuapp.com/sms` |
| `PORT` | Used to configure a port for the HTTP server. This is provided automatically on Heroku, and is defaulted to `3000` if not provided. |

### Fastest option - Heroku Button

The fastest way to deploy this [Node.js](https://nodejs.org) application is to
use [Heroku](https://www.heroku.com/) - click the button below to deploy this
application using your own Heroku account.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Enter in the environment variable values for your application in the provided
form.

### Fast option - Heroku deployment

If you'd prefer to deploy this app to Heroku from the command line, you'll need
the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed.

Clone this repository, and enter it's directory on your computer. Initialize the
app on your Heroku account with the following commands:

```bash
heroku create
git push heroku master
```

This will create a new app for you on Heroku. Next, you will need to use the CLI
to add all your environment variables to the Heroku environment. Note the Heroku
app URL that was created for you in the previous step, and use that in the 
`PRODUCTION_URL` setting. Make sure the URL ends with the `/sms` path.

```bash
heroku config:add IFTTT_KEY=your_key \
    TWILIO_AUTH_TOKEN=your_token \
    PRODUCTION_URL=https://your-new-app-12345.herokuapp.com/sms \
    NODE_ENV=production \
```

This will set four environment variables and restart your Heroku application.

### Self-hosted option

You can also deploy this code on your own server. Instructions for deploying a
Node.js application on an Ubuntu Digital Ocean VPS [can be found here](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04).

In this case, you will need to manually set all the environment variables listed
above.

## Configuring Twilio

Next, you will need to configure a Twilio phone number to work with the application
we just deployed.  In the Twilio console, [purchase an SMS-capable phone number](https://www.twilio.com/console/phone-numbers/search)
to use with this application, or [configure a number you already own](https://www.twilio.com/console/phone-numbers/incoming).

If you search for a number to buy, make sure it is SMS-capable.

![buy an SMS capable number](https://s3.amazonaws.com/com.twilio.prod.twilio-docs/images/buy-sms-number2.width-800.png)

After you buy a number, you will be able to configure a [webhook](https://en.wikipedia.org/wiki/Webhook)
that will execute code on a server whenever your Twilio number receives an incoming
SMS message. Let's change our SMS webhook URL to use our new web app's URL. If you
deployed to Heroku, this would be `https://your-app-here-12345.herokuapp.com/sms`.

![Configure webhook URL](https://s3.amazonaws.com/com.twilio.prod.twilio-docs/images/sms.width-800.png)

*Make sure to save after setting this option!*

## Testing the application

Once things are all set up, you can test the application by sending an SMS to
your Twilio number containing one or many of the commands you configured in 
`commands.js`. If for example you texted your number "pizza plz", and `pizza`
was one of the keywords in `commands.js` as in the example above, the
`order_me_a_pizza` event would be sent to IFTTT.

## License

MIT
