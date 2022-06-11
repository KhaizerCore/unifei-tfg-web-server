var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

/* HTTP API */
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));
    // parse application/json
    app.use(bodyParser.json());
    // Enable CORS all origins *
    app.use(cors());

    /* HTTP ROUTES */
    // parameters( path, function(request, response, nextFunction))
    app.get('/', function(req, res) {
        console.log('GET requested');
    });

    app.post('/', function(req, res) {
        console.log('req body:',req.body);
        res.send('POST requested');
    });

    const iotRouter = require('./routes/iot/app');
    app.use('/iot/app', iotRouter);

    const applicationsRouter = require('./routes/applications/app');
    app.use('/applications/app', applicationsRouter);

    app.listen(5000);

/* MQTT API */

    const mqttClient = require('./iot/mqtt-controller');