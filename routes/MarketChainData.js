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

//var sns = new AWS.SNS();
//var snsTopic =  process.env.NEW_SIGNUP_TOPIC;

var ddb = new AWS.DynamoDB();
var ddbTable = 'MarketChainData';


// signup
router.post('/getdataformarketinrange', function(req, res) {
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

router.post('/getmostrecentdataformarket', function(req, res) {
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
