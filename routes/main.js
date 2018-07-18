// main.js
const router = require('express').Router();
const request = require('request');
const fs = require('fs');


const ABOUT = '/about';
const API = '/api';
const BITTREX = 'https://bittrex.com/api/v1.1/public/';
const COINS = '/api/coins';
const CRYPTOCOINLIST = "https://min-api.cryptocompare.com/data/all/coinlist";
const CONTACT = '/contact';
const GRAPH = '/g/:market';
const GRAPHS = '/g/';
const MARKETS = '/api/markets';
const MARKETS_M = MARKETS + '/:market';
const MARKETSUMMARIES = '/api/marketsummaries';


// API
router.get('/', (req, res) => {
    res.render('table');
});

router.get(ABOUT, (req, res) => {
    res.render('about');
});

router.get(API, (req, res) => {
    res.render('api');
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
    request(CRYPTOCOINLIST, function(error, response, body) {
        var hold = JSON.parse(JSON.stringify(eval('(' + body + ')')));
        var result = {};
        Object.keys(hold["Data"]).forEach( function(key) {
            result[key] = hold["Data"][key].ImageUrl;
        })
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
