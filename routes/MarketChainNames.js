// MarketChainNames.js
const router = require('express').Router();
const request = require('request');
const fs = require('fs');


var AWS = require('aws-sdk');
var bodyParser = require('body-parser');

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

//var sns = new AWS.SNS();
//var snsTopic =  process.env.NEW_SIGNUP_TOPIC;

var ddb = new AWS.DynamoDB();
var ddbTable = 'MarketChainNames';




// background
router.post('/putvalidmarket', function(req, res) {

    var params = {
        TableName: 'MarketChainNames',
        Item: {
            "MarketChainName": { "S": req.body.MarketChainName },
            "MarketLeftName": { "S": req.body.MarketLeftName },
            "MarketRightName": { "S": req.body.MarketRightName }
        }
    }


    ddb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error inserting market chain name: " + err );
        } else {
            console.log("Successfully inserted market chain name: " + data.MarketChainName);
        }
    });
});

router.get('/getvalidmarketnames', function(req, res) {
    var params = {
        TableName: ddbTable,
        Key: {
            "MarketChainName": { "S": "BTC_XXX_ETH" }
        },
        Item: {
            "MarketLeftName": { "S": "BTC_XXX_ETH_BTC" },
            "MarketRightName": { "S": "BTC_ETH_XXX_BTC" },
            "Supported": { "BOOL": true }
        }
    }


});

module.exports = router;
