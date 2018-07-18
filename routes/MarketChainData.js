// dynamo.js
const router = require('express').Router();
const request = require('request');
const fs = require('fs');
var AWS = require('aws-sdk');
var bodyParser = require('body-parser');


AWS.config.update({
    //endpoint: "http://localhost:8000",
    region: "us-west-2"
});


const ddb = new AWS.DynamoDB();
const ddbTable = 'MarketChainData';
const POST_DATA_FOR_MARKET = '/api/dev/putdataformarket';
const GET_DATA_FOR_MARKET_IN_RANGE = '/api/getdataformarketinrange/:marketchainname.:start.:end';


// Gets the data for a given market between the times starttime and endtime
router.get(GET_DATA_FOR_MARKET_IN_RANGE, function(req, res) {
    // between is inclusive
    var params = {
        TableName: ddbTable,
        ProjectionExpression: "LeftVal, RightVal, DataTimestamp",
        KeyConditionExpression: "MarketChainName = :mcn and DataTimestamp between :starttime and :endtime",
        ExpressionAttributeValues: {
            ":mcn": { "S": req.params.marketchainname },
            ":starttime": { "S": req.params.start.toString() },
            ":endtime": { "S": req.params.end.toString() }
        },
        ScanIndexForward: true
    }

    ddb.query(params, function(err, data) {
        if (err) {
            console.log("Unable to query market data for market " + req.params.marketchainname + ". Error JSON: ", JSON.stringify(err, null, 2));

            res.json(err);
        }
        else {
            console.log("MarketChainData query for " + req.params.marketchainname + " succeeded.");

            res.json(data);
        }
    });
});


/****************************************************************************************************
 ***** LOCAL DEVELOPMENT ONLY - NOT USED IN APPLICATION *****
 ****************************************************************************************************
 
// Posts the data for a given market at a given timestamp
router.post(POST_DATA_FOR_MARKET, function(req, res) {
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
*/


module.exports = router;
