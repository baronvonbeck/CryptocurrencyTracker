// MarketChainNames.js
const router = require('express').Router();
const request = require('request');
const fs = require('fs');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');


AWS.config.update({
    //endpoint: "http://localhost:8000",
    region: "us-west-2"
});


const ddb = new AWS.DynamoDB();
const ddbTable = 'MarketChainNames';
const POST_VALID_MARKET = '/api/dev/putvalidmarket';
const GET_MARKET_NAMES = '/api/getmarketnames/:marketchainname';
const GET_ALL_VALID_MARKET_NAMES = '/api/getallvalidmarketnames';




// Gets the market name, the left market name, and the right market name for an individual market for use for displaying on graphs
router.get(GET_MARKET_NAMES, function(req, res) {
    var params = {
        TableName: ddbTable,
        Key: {
            "MarketChainName": { "S": req.params.marketchainname }
        },
        ProjectionExpression: "MarketLeftName, MarketRightName"
    }

    ddb.getItem(params, function(err, data) {
        if (err) {
            console.log("Unable to scan market names for market. Error JSON: ", JSON.stringify(err, null, 2));

            res.json(err);
        }
        else {
            console.log("Got market names for " + req.params.marketchainname + " successfully");

            res.json(data);
        }
    });
});


// Gets all of the valid market names we collect data on graphs for. This list is updated on the back end periodically and automatically
router.get(GET_ALL_VALID_MARKET_NAMES, function(req, res) {
    var params = {
        TableName: ddbTable,
        ProjectionExpression: "MarketChainName"
    }

    ddb.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the MarketChainNames table for all valid markets. Error JSON: ", JSON.stringify(err, null, 2));

            res.json(err);
        }
        else {
            console.log("MarketChainNames scan for all names succeeded.");

            // continue scanning if there are more markets, because
            // scan can retrieve a maximum of 1MB of data
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning MarketChainNames for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                ddb.scan(params, onScan);
            }

            res.json(data);
        }
    }
});


/****************************************************************************************************
 ***** LOCAL DEVELOPMENT ONLY - NOT USED IN APPLICATION *****
 ****************************************************************************************************
 
// Posts a valid market and its corresponding left and right names into dynamoDB
router.post(POST_VALID_MARKET, function(req, res) {
    var params = {
        TableName: ddbTable,
        Item: {
            "MarketChainName": { "S": req.body.MarketChainName },
            "MarketLeftName": { "S": req.body.MarketLeftName },
            "MarketRightName": { "S": req.body.MarketRightName }
        }
    }

    ddb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error while inserting market chain name " + req.body.MarketChainName + ": " + JSON.stringify(err, null, 2) );
        }
        else {
            console.log("Successfully inserted market chain name: " + req.body.MarketChainName);
        }
    });

    res.end();
});
*/

module.exports = router;
