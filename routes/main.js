// main.js
const router = require('express').Router();
const request = require('request');
const fs = require('fs');


var ABOUT = '/about';
var BITTREX = 'https://bittrex.com/api/v1.1/public/';
var COINS = '/coins';
var CRYPTOCOINLIST = "https://min-api.cryptocompare.com/data/all/coinlist";
var CONTACT = '/contact';
var GRAPH = '/g/:market';
var GRAPHS = '/g/';
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
    res.render('graph.ejs', {market: ""});
});

router.get(GRAPH, (req, res) => {
    //res.send(req.params)
    res.render('graph.ejs', req.params);
});

// Get cryptocompare coin list for image URLs
router.get(COINS, (req, res) => {
    var url = CRYPTOCOINLIST;
    request(url, function(error, response, body) {
        var result = JSON.parse(JSON.stringify(eval('(' + body + ')')));
        res.json(result);
    });
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
