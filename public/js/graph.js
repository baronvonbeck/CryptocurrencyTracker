/* graph.js */

// Maximum number of displayable graphs
const MAX_MARKETS = 5;

// Refresh rate
const REFRESH = 10000;

// List of all possible graphs
var allMarketNames = [];

// Contains graphs currently being displayed
var displayedMarkets = {};

// Contains all market data for graphing in D3
var marketData = {};

$(document).ready(function() {
	// add all the market names to the dropdown
	addMarketNamesToDropdown();

	// if there was a graph context, display that graph
	displayNewMarketOnGraph("BTC_ADA_ETH");

	setInterval(function() {
		updateCurrentlyDisplayedGraphs();
	}, REFRESH);
});



/*
 * Displays a new market on the graph if 
 *   1. That market is not on the graph yet
 *	 2. There are fewer than MAX_MARKETS
 */
function displayNewMarketOnGraph(marketName) {

	if (!displayedMarkets.hasOwnProperty(marketName) 
		&& Object.keys(displayedMarkets).length < MAX_MARKETS) {

		getMarketNamesForMarket(marketName,
			getMarketNamesForMarketCallback);

		var marketRange = {
			"marketname": marketName,
			"start": "1530764574204",
			"end": Date.now()
		};
		getMarketDataForMarketInRange(marketRange, getMarketDataForMarketInRangeCallback);

		//TODO: add to D3 graphs
	}
	else if (!displayedMarkets.hasOwnProperty(marketName)) {
		//TODO: display error message on page saying marketName has already been graphed
	}
	else if (Object.keys(displayedMarkets).length < MAX_MARKETS) {
		//TODO: display error message on graph page saying maximum number of markets is already being displayed
	}
}


// Updates all of the currently displayed 
function updateCurrentlyDisplayedGraphs() {
	Object.keys(displayedMarkets).forEach( function(key) {
		console.log(marketData[key]);
		var marketRange = {
			"marketname": key,
			"start": parseInt(marketData[key][marketData[key].length - 1].DataTimestamp) + 1,
			"end": Date.now()
		};
		getMarketDataForMarketInRange(marketRange, getMarketDataForMarketInRangeAppendCallback);

		//TODO: update data points in the D3 graph
	});
}


// Removes market from the graph
function removeMarketFromGraph(marketName) {
	delete displayedMarkets[marketName];
	delete marketData[marketName];

	//TODO: remove the market from the D3 graph
}


// Gets all market names and adds them all to the dropdown for the user to select
function addMarketNamesToDropdown() {
	getAllValidMarketNames(getAllValidMarketNamesCallback);
}


// Adds all market names to the dropdown
function addToDropdown() {
	//TODO: add allMarketNames to the dropdown
}

/*****************************************************************************
 * Callback Functions ----- START ------
 *****************************************************************************/

/* 
 * Callback for getting the data for a market
 */
function getMarketDataForMarketInRangeCallback(data) {
	var key = Object.keys(data)[0];
	
	marketData[key] = data[key];

	/*
	console.log(key);
	marketData[key].forEach(function(item) {
		console.log(item);
		console.log("Data " + item.DataTimestamp + "  " + item.LeftVal + "  " + item.RightVal);
	});
	*/
}


/* 
 * Callback for appending new market data
 */
function getMarketDataForMarketInRangeAppendCallback(data) {
	var key = Object.keys(data)[0];
	
	marketData[key].push(data[key]);

	// NOT WORKING
	/*
	console.log(key);
	marketData[key].forEach(function(item) {
		console.log(item);
		console.log("Data " + item.DataTimestamp + "  " + item.LeftVal + "  " + item.RightVal);
	});
	*/
}


/* 
 * Callback for getting the left and right names for a market
 */
function getMarketNamesForMarketCallback(data) {
	displayedMarkets[data.MarketChainName] = {
		"MarketLeftName": data.MarketLeftName,
		"MarketRightName": data.MarketRightName
	}

	/*
	console.log("SUCCESS  " + data.MarketChainName + " -- " + displayedMarkets[data.MarketChainName].MarketLeftName + " -- " + displayedMarkets[data.MarketChainName].MarketRightName);
	*/
}


/* Callback for getting all possible market chain names
 *
 */
function getAllValidMarketNamesCallback(data) {
	allMarketNames = data;

	addToDropdown();

	/*
	allMarketNames.forEach(function(item) {
		console.log("success: " + item);
	});
	*/
}
/*****************************************************************************
 * Callback Functions ----- END ------
 *****************************************************************************/
