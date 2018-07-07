/* main-table.js */

/*
 * "Left" and "Right" parts of a market chain:
 *      By this we mean the two variations of a given chain. The chain
 *      AAA->BBB->CCC->AAA (where AAA and CCC are part of the validMarkets,
 *      and BBB is any of the other markets that can complete the chain),
 *      can have two variations:
 *          Left:  AAA->CCC->BBB->AAA
 *          Right: AAA->BBB->CCC->AAA
 */

// main associative array to hold data per market name (e.g. "BTC-LTC")
var marketSummaries = {};

// 2D array to convert one coin into another
// newcoin = oldcoin * conversions[old coin symbol][new coin symbol];
var conversions = {};

/*
 * Markets the user can start and end on. These are the only ones currently
 * supported in conjunction with many others via Bittrex's API
 */
var validMarkets =  {
    "BTC"   : true,
    "ETH"   : true,
    "USDT"  : true,
    "USD"   : true
};

// associative arrays to hold each chain loop
var markets = [];
var currentMarkets = [];
var previousMarkets = [];

// selected sort method. Default is 2, descending from best to worst value
var selectedSortMethod = 2;

// array of supported sorting methods
var sortMethods = [
    aToZ,
    zToA,
    descending,
    ascending,
    leftDescending,
    leftAscending,
    rightDescending,
    rightAscending
];

// pause the updating
var paused = false;

// (1.00 - 0.0025) ^ 3
// representing the remaining balance after three trades through a chain loop
const fee = 0.992518734375;

// maintain track of what rows are highlighted in the main table
var highlightedMarkets = {};

// Routes - MarketChainNames
const POST_VALID_MARKET = '/putvalidmarket';
const GET_MARKET_NAMES = '/getmarketnames/';
const GET_ALL_VALID_MARKET_NAMES = '/getallvalidmarketnames';

// Routes - Bittrex
const MARKET_SUMMARIES = '/marketsummaries';

// Routes - MarketChainData
const POST_DATA_FOR_MARKET = '/putdataformarket';
const GET_DATA_FOR_MARKET_IN_RANGE = '/getdataformarketinrange/';


$(document).ready(function() {
     initialize();

     setInterval(function() {
         update();
     }, 2000);
});


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


// Gets the data for a given market between the times starttime and endtime
function getMarketDataForMarketInRange(marketData) {
    $.ajax({
        url: GET_DATA_FOR_MARKET_IN_RANGE + marketData.marketname + "." + marketData.start + "." + marketData.end,
        async: true,
        success: (function(data) {
            console.log(data);
            data.Items.forEach(function(item) {
                console.log("Got chain name: " + item.MarketChainName.S + " - " + item.LeftVal.N + " - " + item.RightVal.N + " - " + item.DataTimestamp.S);
            });
        })
    });
}


// Gets all of the valid market names we collect data on graphs for. This list is updated on the back end periodically and automatically
function getMarketNamesForMarket(name) {
    $.ajax({
        url: GET_MARKET_NAMES + name,
        async: true,
        success: (function(data) {
            console.log("Got chain name: " + data.Item.MarketChainName.S + " - " + data.Item.MarketLeftName.S + " - " + data.Item.MarketRightName.S);

        })
    });
}


// Gets the market name, the left market name, and the right market name for an individual market for use for displaying on graphs
function getAllValidMarketNames() {
    $.ajax({
        url: GET_ALL_VALID_MARKET_NAMES,
        async: true,
        dataType: 'json',
        success: (function(data) {
            console.log("Got all Market Chain Names");
            data.Items.forEach(function(item) {
                console.log(" -", item.MarketChainName.S);
            });
        })
    });
}


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


function initialize() {

     // Bittrex API: get summary of all market exchanges
     // put each summary into an associate array with market name as key (e.g. "BTC-LTC")
     $.ajax({
         url: MARKET_SUMMARIES,
         success: (function (data) {
             if (data.result === null ) {
                 console.log("Failed 'getMarketSummaries()'");
                 return;
             }

             getValidMarketConversions(data.result);
             findValidConversionChains();
             calculateMarketValues();
             sortMarkets(selectedSortMethod);

             // iterate through market chains to create html table
             for (var i = 0; i < currentMarkets.length; i ++) {

                 var market = currentMarkets[i];
                 highlightedMarkets[market.name] = false;

                 var selectIDLeft = i + "-LEFT";
                 var selectIDRight = i + "-RIGHT";
                 var selectID = i + "-MARKET";

                 $("#main-table").append(
                     '<tr class="trow">' +
                     '<img src="http://placecorgi.com/32/32" class="td-avatar"/>'+
                     '<td class="market" id=' + selectID + '>' + market.name + '</td>' +
                     '<td class="left" id=' + selectIDLeft + '>' + market.leftname + "<br>" + ((market.left < 1) ? '<font color="red">' : '<font color="turquoise">') + market.left + '</font></td>' +
                     '<td class="right" id=' + selectIDRight + '>' + market.rightname + "<br>" + ((market.right < 1) ? '<font color="red">' : '<font color="turquoise">') + market.right + '</font></td>' +
                     '</tr>'
                 );
             }

             activateHighlightCallback();
             activateSortDropdownCallback();

             // make reference to a deep copy
             previousMarkets = currentMarkets.slice(0);
         })
     });
}


function update() {
     $.ajax({
         url: MARKET_SUMMARIES,
         success: (function (data) {
             if (data.result === null) {
                 console.log("Failed 'getMarketSummaries()'");
                 return;
             }

             getValidMarketConversions(data.result);
             findValidConversionChains();
             calculateMarketValues();
             sortMarkets(selectedSortMethod);

             if (paused) {
                 currentMarkets = previousMarkets.slice(0);
             }

             // iterate through market chains to update html table
             for (var i = 0; i < currentMarkets.length; i ++) {
                 var market = currentMarkets[i];
                 var selectIDLeft = "#" + i + "-LEFT";
                 var selectIDRight = "#" + i + "-RIGHT";
                 var selectID = "#" + i + "-MARKET";

                 $("#main-table tr:nth-child(" + (i + 2) + ")" ).removeClass("selected");

                var mVal = 0;
                for(var j = 0; j < markets.length; j ++) {
                    if(markets[j] === currentMarkets[i]){
                        mVal = j;
                    }
                }
                var lName = markets[mVal].a + "_" + markets[mVal].c + "_" + markets[mVal].b +"_" + markets[mVal].a;
                var rName =  markets[mVal].a + "_" + markets[mVal].b + "_" + markets[mVal].c +"_" + markets[mVal].a;


                $(selectID).html(
                    '<div class="avatar-container">' +
                   '<img src="http://placecorgi.com/32/32" class="td-avatar"/>' +
                    '<img src="http://placecorgi.com/32/32" class="td-avatar"/>' +
                    '<img src="http://placecorgi.com/32/32" class="td-avatar"/>' +
                    '</div>' +
                    "<a href=/g/" + market.name + "." + lName + "." + rName + ">" + market.name + "</a>"
                );
                
                 $(selectIDLeft).html(
                     market.leftname + "<br>" + ((market.left < 1) ? '<font color="red">' : '<font color="turquoise">') + market.left + '</font>'
                 );
                 $(selectIDRight).html(
                     market.rightname + "<br>" + ((market.right < 1) ? '<font color="red">' : '<font color="turquoise">') + market.right + '</font>'
                 );

                 if (highlightedMarkets[market.name] == true) {
                     $("#main-table tr:nth-child(" + (i + 2) + ")" ).addClass("selected");
                 }
             }

             previousMarkets = currentMarkets.slice(0);
         })
     });
}


 /*
  * Get all possible market conversions between 2 different currencies
  */
function getValidMarketConversions(reference) {
     // iterate through markets and put them each into an array
     for (var i = 0; i < reference.length; i ++) {

         // ignore invalid/empty markets
         if (reference[i].Bid <= 0)
             continue;

         marketSummaries[reference[i].MarketName] = reference[i];
     }
}


/*
 * Dynamically finds all possible conversion chains via Bittrex's API,
 * assuming the only markets the user can start and end on are the ones
 * listed in validMarkets.
 */
function findValidConversionChains() {
    markets = [];
    var exists = {};

    for (var key in marketSummaries) {
        var separate = key.split("-");

        // create lookup table for converting one currency to another
        // newcoin = oldcoin * conversions[old coin symbol][new coin symbol];
        if (undefined === conversions[separate[0]])
            conversions[separate[0]] = {};
        conversions[separate[0]][separate[1]] = 1 / marketSummaries[key].Ask;

        if (undefined === conversions[separate[1]])
            conversions[separate[1]] = {};
        conversions[separate[1]][separate[0]] = marketSummaries[key].Bid;

        if (separate[0] in validMarkets) {

            for (var end in validMarkets) {  // For each possible end coin

                /*
                 * Form a chain if:
                 *      1. The start doesn't equal the end
                 *      2. The middle can form a chain with the end
                 *      3. The chain's reverse does not exist
                 */
                if (separate[0] != end && (end + "-" + separate[1]) in marketSummaries
                    && !((end + separate[1] + separate[0]) in exists) ) {

                    exists[separate[0] + separate[1] + end] = true;
                    markets.push(
                        {
                            a: separate[0],
                            b: separate[1],
                            c: end,
                            name: separate[0] + '_' + separate[1] + '_' + end,
                            rightname: separate[0] + " &#10236; " + separate[1] + " &#10236; " + end + " &#10236; " + separate[0],
                            leftname: separate[0] + " &#10236; " + end + " &#10236; " + separate[1] + " &#10236; " + separate[0]
                        }
                    ); // these objects will be used for obtaining .left and .right values later ('conversions' may not be fully populated)
                }
            }
        }
        else {
            console.log("Unknown base '" + separate[0] + "'");
        }
    }
}


/*
 * Generalized function for calculating the "left" and "right"
 * parts of a market. See definition of "left" and "right" above
 */
function calculateMarketValues() {

    for (var i = 0; i < markets.length; i ++) {
        var market = markets[i];

        market.left  =  conversions[market.a][market.c] *
                        conversions[market.c][market.b] *
                        conversions[market.b][market.a] * fee;
        market.right =  conversions[market.a][market.b] *
                        conversions[market.b][market.c] *
                        conversions[market.c][market.a] * fee;
    }
}


/*
 * Sorts using the function in sortMethods at index paramater passed in
 */
function sortMarkets(index) {
    currentMarkets = markets.slice(0);

    currentMarkets.sort(function(a, b) {
        return sortMethods[index](a, b);
    });
}


/*****************************************************************************
 * Callback Functions ----- START ------
 *****************************************************************************/
/*
 * Callback function for pausing
 */
function pauseCallback() {
    if (paused) $('#pause-button').html("&#10074;&#10074;");
    else $('#pause-button').html("&#9658;");
    paused = !paused;
}


/*
 * Callback function for highlighting clicked rows
 */
function activateHighlightCallback() {
    $('#main-table .trow').click(function() {
        var marketName = $(this).children()[0].innerText;

        if (highlightedMarkets[marketName] == true)
            highlightedMarkets[marketName] = false;
        else
            highlightedMarkets[marketName] = true;

        $(this).toggleClass("selected");
    });
}


/*
 * Callback function for getting sort dropdown value
 */
function activateSortDropdownCallback() {
    $("#sort-methods").change(function() {
        selectedSortMethod = $(this).val();
    });
}
/*****************************************************************************
 * Callback Functions ----- END ------
 *****************************************************************************/


/*****************************************************************************
 * Sorting Comparator Functions ----- START ------
 *****************************************************************************/
function aToZ(x, y) {
     var xlower = x.name.toLowerCase();
     var ylower = y.name.toLowerCase();

     return xlower < ylower ? -1 : xlower > ylower ? 1 : 0;
}


function zToA(x, y) {
    var xlower = x.name.toLowerCase();
    var ylower = y.name.toLowerCase();

    return ylower < xlower ? -1 : ylower > xlower ? 1 : 0;
}


function descending(x, y) {
    return Math.max(y.left, y.right) - Math.max(x.left, x.right);
}


function ascending(x, y) {
    return Math.min(x.left, x.right) - Math.min(y.left, y.right);
}


function leftDescending(x, y) {
    return y.left - x.left;
}


function leftAscending(x, y) {
    return x.left - y.left;
}


function rightDescending(x, y) {
    return y.right - x.right;
}


function rightAscending(x, y) {
    return x.right - y.right;
}
/*****************************************************************************
 * Sorting Comparator Functions ----- END ------
 *****************************************************************************/
