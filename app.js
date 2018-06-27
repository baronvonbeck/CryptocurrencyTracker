// app.js
const PORT = 3000;
const express = require('express');
const mainRoutes = require('./routes/main');

const AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();

// app & middleware setup
const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(function(req, res, next) {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});
app.use('/', mainRoutes);
app.use(express.static('public'));


app.set('port', process.env.PORT || 8080);
app.listen(app.get('port'), () => {
    console.log("Listening on port: " + app.get('port'));
});

module.exports = app;
