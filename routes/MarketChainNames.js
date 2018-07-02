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

const ddb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const ddbTable = 'MarketChainNames';


// background
router.post('/putvalidmarket', function(req, res) {

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
            console.log("Error inserting market chain name: " + err );
        } else {
            console.log("Successfully inserted market chain name: " + data.MarketChainName);
        }
    });
});

router.get('/getmarketnames/:marketchainname', function(req, res) {
    console.error("HERE! " + req.params.marketchainname);
    var params = {
        TableName: ddbTable,
        Key: {
            MarketChainName: req.params.marketchainname
        }
    }

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
        } else {
            console.log("Got market names successfully!");
            res.json(data);
        }
    });
});

router.get('/getvalidmarketnames', function(req, res) {
    var params = {
        TableName: ddbTable,
        ProjectionExpression: "MarketChainName"
    }

    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the MarketChainNames table. Error JSON: ", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("MarketChainNames scan succeeded.");

            // continue scanning if we have more movies, because
            // scan can retrieve a maximum of 1MB of data
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning MarketChainNames for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }

            res.json(data);
        }
    }
});

module.exports = router;
