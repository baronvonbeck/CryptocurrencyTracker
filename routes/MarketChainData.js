// dynamo.js
const router = require('express').Router();
const request = require('request');
const fs = require('fs');
var AWS = require('aws-sdk');
var bodyParser = require('body-parser');


AWS.config.update({
    endpoint: "http://localhost:8000",
    region: "us-west-2"
});


const ddb = new AWS.DynamoDB();
const ddbTable = 'MarketChainData';
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
            "DataTimestamp": { "S": req.body.DataTimestamp.toString() }
        }
    }

    ddb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error while inserting data for market chain name " + req.body.MarketChainName + ": " + JSON.stringify(err, null, 2) );
        }
        else {
            console.log("Successfully inserted market chain data for: " + req.body.MarketChainName);
        }
    });

    res.end();
});


// signup
router.get(GET_DATA_FOR_MARKET_IN_RANGE, function(req, res) {
    var params = {
        TableName: ddbTable,
        ProjectionExpression: "MarketChainName, LeftVal, RightVal, DataTimestamp",
        KeyConditionExpression: "MarketChainName = :mcn and DataTimestamp between :starttime and :endtime",
        ExpressionAttributeValues: {
            ":mcn": req.params.marketchainname,
            ":starttime": req.params.start.toString(),
            ":endtime": req.params.end.toString()
        }
    }

    ddb.query(params, function(err, data) {
        if (err) {
            console.log("Unable to query market data for market " + req.params.marketchainname + ". Error JSON: ", JSON.stringify(err, null, 2));
        }
        else {
            console.log("MarketChainData query for " + req.params.marketchainname + " succeeded.");

            res.json(data);
        }
    });
});


module.exports = router;
