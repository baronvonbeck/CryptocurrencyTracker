// app.js

// Include the cluster module
var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for terminating workers
    cluster.on('exit', function (worker) {

        // Replace the terminated workers
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();
    });

// Code to run if we're in a worker process
}
else {
    const express = require('express');
    const bodyParser = require('body-parser');
    const mainRoutes = require('./routes/main');
    const marketChainDataRoutes = require('./routes/MarketChainData');
    const marketChainNameRoutes = require('./routes/MarketChainNames');

    // app & middleware setup
    const app = express();
    app.set('view engine', 'ejs');
    app.set('views', './views');

    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

    app.use(function(req, res, next) {
        console.log(`${req.method} request for '${req.url}'`);
        next();
    });
    app.use('/', mainRoutes);
    app.use('/', marketChainDataRoutes);
    app.use('/', marketChainNameRoutes);
    app.use(express.static('public'));

    var port = process.env.PORT || 3000;
    var server = app.listen(port, function() {
        console.log("Server running at " + port);
    });

    module.exports = app;
}
