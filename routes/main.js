// main.js
const router = require('express').Router();
const request = require('request');
const fs = require('fs');


var ABOUT = '/about';
var BITTREX = 'https://bittrex.com/api/v1.1/public/';
var CONTACT = '/contact';
var GRAPH = '/g/:market';
var GRAPHS = '/graphs';
var MARKETS = '/markets';
var MARKETS_M = MARKETS + '/:market';
var MARKETSUMMARIES = '/marketsummaries';

// API
router.get('/', (req, res) => {
    res.render('table');
});

router.get(ABOUT, (req, res) => {
    res.render('about');
});

router.get(CONTACT, (req, res) => {
    res.render('contact');
});

router.get(GRAPHS, (req,res) => {
    res.render('graphs.ejs');
});

router.get(GRAPH, (req, res) => {
    //res.send(req.params)
    console.log(req.params.market === '');
    res.render('graph.ejs', req.params);


});

// Get available markets
router.get(MARKETS, (req, res) => {
    var url = BITTREX + 'getmarkets';
    request(url, function(error, response, body) {
        var result = JSON.parse(JSON.stringify(eval('(' + body + ')')));
        res.json(result);
    });
});

// Get market summaries
router.get(MARKETSUMMARIES, (req, res) => {
    var url = BITTREX + 'getmarketsummaries';
    request(url, function(error, response, body) {
        var result = JSON.parse(JSON.stringify(eval('(' + body + ')')));
        res.json(result);
    });
});

// Get current tick value
router.get(MARKETS_M, (req, res) => {
    var market = req.params.market.trim();
    var url = BITTREX + 'getticker?market=' + market;
    request(url, function(error, response, body) {
        var result = JSON.parse(JSON.stringify(eval('(' + body + ')')));
        res.json(result);
    });
});

module.exports = router;
