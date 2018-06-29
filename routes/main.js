// main.js
const router = require('express').Router();
const request = require('request');
const fs = require('fs');

// API
var BITTREX = 'https://bittrex.com/api/v1.1/public/';

router.get('/', (req, res) => {
    res.render('table');
});

router.get('/about', (req, res) => {
    res.render('about');
});

// Get available markets
router.get('/markets', (req, res) => {
    var url = BITTREX + 'getmarkets';
    request(url, function(error, response, body) {
        var result = JSON.parse(JSON.stringify(eval('(' + body + ')')));
        res.json(result);
    });
});

// Get market summaries
router.get('/marketsummaries', (req, res) => {
    var url = BITTREX + 'getmarketsummaries';
    request(url, function(error, response, body) {
        var result = JSON.parse(JSON.stringify(eval('(' + body + ')')));
        res.json(result);
    });
});

// Get current tick value
router.get('/markets/:market', (req, res) => {
    var market = req.params.market.trim();
    var url = BITTREX + 'getticker?market=' + market;
    request(url, function(error, response, body) {
        var result = JSON.parse(JSON.stringify(eval('(' + body + ')')));
        res.json(result);
    });
});

module.exports = router;
