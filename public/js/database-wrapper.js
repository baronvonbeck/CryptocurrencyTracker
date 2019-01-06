/* database-wrapper.js
 * 
 * Wrapper class for getting data from and posting data to the database. Post
 * methods are included for local development only. The only methods used in 
 */

// Routes - MarketChainNames
const POST_VALID_MARKET = '/api/dev/putvalidmarket';
const GET_MARKET_NAMES = '/api/getmarketnames/';
const GET_ALL_VALID_MARKET_NAMES = '/api/getallvalidmarketnames';

// Routes - MarketChainData
const POST_DATA_FOR_MARKET = '/api/dev/putdataformarket';
const GET_DATA_FOR_MARKET_IN_RANGE = '/api/getdataformarketinrange/';



// Gets the data for a given market between the times starttime and endtime
function getMarketDataForMarketInRange(marketData, callback) {
    $.ajax({
        url: GET_DATA_FOR_MARKET_IN_RANGE + marketData.marketname + "." + marketData.start + "." + marketData.end,
        async: true,
        success: (function(data) {
            // console.log("Got all market data for " + marketData.marketname);

            var retVal = {};
            retVal[marketData.marketname] = [];
            var retValArr = retVal[marketData.marketname];

            data.Items.forEach(function(item) {
                retValArr.push({
                    "DataTimestamp": item.DataTimestamp.S,
                    "LeftVal": parseFloat(item.LeftVal.N),
                    "RightVal": parseFloat(item.RightVal.N)
                });
            });

            callback(retVal);
        })
    });
}


// Gets the market name, the left market name, and the right market name for an individual market for use for displaying on graphs
function getMarketNamesForMarket(name, callback) {
    $.ajax({
        url: GET_MARKET_NAMES + name,
        async: true,
        success: (function(data) {
            //console.log("Got chain names for: " + name + " - " + data.Item.MarketLeftName.S + " - " + data.Item.MarketRightName.S);

            var retVal = {
                "MarketChainName": name,
                "MarketLeftName": data.Item.MarketLeftName.S,
                "MarketRightName": data.Item.MarketRightName.S
            }; 
            callback(retVal);
        })
    });
}


// Gets all of the valid market names we collect data on graphs for. This list is updated on the back end periodically and automatically
function getAllValidMarketNames(callback) {
    $.ajax({
        url: GET_ALL_VALID_MARKET_NAMES,
        async: true,
        dataType: 'json',
        success: (function(data) {
            // console.log("Got all Market Chain Names");

            var retVal = [];
            data.Items.forEach(function(item) {
                // console.log(" -", item.MarketChainName.S);
                retVal.push(item.MarketChainName.S);
            });
            callback(retVal);
        })
    });
}


/****************************************************************************************************
 ***** LOCAL DEVELOPMENT ONLY - NOT USED IN APPLICATION *****
 ****************************************************************************************************
 
// Posts a valid market and its corresponding left and right names into dynamoDB
function postValidMarket(marketData) {
    $.ajax({
        type: 'POST',
        url: POST_VALID_MARKET,
        async: true,
        data: JSON.stringify(marketData),
        dataType: 'json',
        contentType: "application/json",
        success: (function(data) {
            console.log("Return succsessful for adding market names for: " + marketData.MarketChainName);
        })
    });
}


// Posts the data for a given market at a given timestamp
function postMarketData(marketData) {
    $.ajax({
        type: 'POST',
        url: POST_DATA_FOR_MARKET,
        async: true,
        data: JSON.stringify(marketData),
        dataType: 'json',
        contentType: "application/json",
        success: (function(data) {
            console.log("Return succsessful for data post for: " + marketData.MarketChainName);
        })
    });
}

*****************************************************************************************************
*/