// dynamo.js
const router = require('express').Router();
const request = require('request');
const fs = require('fs');
var AWS = require('aws-sdk');
var bodyParser = require('body-parser');

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});


var ddb = new AWS.DynamoDB();
var ddbTable = 'MarketChainData';
const PUT_DATA_FOR_MARKET = '/putdataformarket';
const GET_DATA_FOR_MARKET_IN_RANGE = '/getdataformarketinrange/:marketchainname.:start.:end';

// Posts the data for a given market at a given timestamp
router.post(PUT_DATA_FOR_MARKET, function(req, res) {
    var params = {
        TableName: ddbTable,
        Item: {
            "MarketChainName": { "S": req.body.MarketChainName },
            "LeftVal": { "N": req.body.RightVal.toString() },
            "RightVal": { "N": req.body.LeftVal.toString() },
            "DataTimestamp": { "S": req.body.DataTimestamp.toString() },
        }
    }

    ddb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error while inserting data for market chain name " + req.body.MarketChainName + ": " + JSON.stringify(err, null, 2) );
        } else {
            console.log("Successfully inserted market chain data for: " + req.body.MarketChainName);
        }
    });
});


// signup
router.get(GET_DATA_FOR_MARKET_IN_RANGE, function(req, res) {
    var item = {
        'email': {'S': req.body.email},
        'name': {'S': req.body.name},
        'preview': {'S': req.body.previewAccess},
        'theme': {'S': req.body.theme}
    };

    ddb.putItem({
        'TableName': ddbTable,
        'Item': item,
        'Expected': { email: { Exists: false } }
    }, function(err, data) {
        if (err) {
            var returnStatus = 500;

            if (err.code === 'ConditionalCheckFailedException') {
                returnStatus = 409;
            }

            res.status(returnStatus).end();
            console.log('DDB Error: ' + err);
        } else {

        }
    });
});


module.exports = router;
