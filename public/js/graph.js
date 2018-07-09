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


	const width = 960;
	const height = 480;

	var canvas = d3.select('body')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('id', 'canvas');

	var plotMargins = {
		top: 30,
		bottom: 30,
		left: 150,
		right: 30
	};

	var plotGroup = canvas.append('g')
		.classed('plot', true)
		.attr('transform', `translate(${plotMargins.left},${plotMargins.top})`);

	var plotWidth = width - plotMargins.left - plotMargins.right;
	var plotHeight = height - plotMargins.top - plotMargins.bottom;

	// x-axis
	var xScale = d3.scaleTime().range([0, plotWidth]);
	var xAxis = d3.axisBottom(xScale);
	var xAxisGroup = plotGroup.append('g')
		.classed('x', true)
		.classed('axis', true)
		.attr('transform', `translate(${0},${plotHeight})`)
		.call(xAxis);

	// y-axis
	var yScale = d3.scaleLinear().range([plotHeight, 0]);
	var yAxis = d3.axisLeft(yScale);
	var yAxisGroup = plotGroup.append('g')
		.classed('y', true)
		.classed('axis', true)
		.call(yAxis);

	var pointsGroup = plotGroup.append('g').classed('points', true);

	var myData = [
	    {
	    "name": "John",
	    "age": 30,
		"score": 50,
	    "city": "New York"
	    },
	    {
	    "name": "Jane",
	    "age": 20,
		"score": 67,
	    "city": "San Francisco"
		},
		{
	    "name": "Pizza",
	    "age": 25,
		"score": 27,
	    "city": "New York"
	    },
	    {
	    "name": "HotDog",
	    "age": 10,
		"score": 98,
	    "city": "San Francisco"
	    }
	];

	xScale.domain(d3.extent(myData, d=> d.age)).nice();
	xAxisGroup.call(xAxis);

	yScale.domain(d3.extent(myData, d=> d.score)).nice();
	yAxisGroup.call(yAxis);

	var dataBound = pointsGroup.selectAll('.post').data(myData);

	// Delete extra points
	dataBound.exit().remove();

	// Add new points
	var enterSelection = dataBound.enter().append('g').classed('post', true);
	enterSelection.append('circle').attr('r', 2).style('fill', 'red');

	// Update existing points
	enterSelection.merge(dataBound)
		.attr('transform', (d, i) => `translate(${xScale(d.age)},${yScale(d.score)})`)




	d3.select("body").append('p').text("TEST");
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


/*
 * Makes a hidden market on the graph visible
 */
function showMarketOnGraphHandler(marketNameLR) {
	//TODO: show a market on the graph that has been hidden
}


/*
 * Makes a visible market on the graph hidden
 */
function hideMarketOnGraphHandler(marketNameLR) {
	//TODO: hide a market on the graph that is visible
}



/*****************************************************************************
 * Handler Functions ----- START ------
 *****************************************************************************/

/*
 * Handler for clicking the remove button to remove a market from the graph
 */
function removeMarketFromGraphHandler(marketName) {
	removeMarketFromGraph(marketName);
}


/*
 * Handler for clicking the add button to add a market to the graph
 */
function addNewMarketToGraphHandler(marketName) {
	displayNewMarketOnGraph(marketName);
}


/*
 * Handler for showing a hidden market on the graph
 */
function showMarketOnGraphHandler(marketNameLR) {
	showMarketOnGraph(marketNameLR);
}


/*
 * Handler for hiding a visible market on the graph
 */
function hideMarketOnGraphHandler(marketNameLR) {
	hideMarketOnGraph(marketNameLR);
}

/*****************************************************************************
 * Handler Functions ----- END ------
 *****************************************************************************/



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

	if (data[key].length > 0) marketData[key].push(data[key]);

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
		"MarketLeftVisible": true,
		"MarketRightName": data.MarketRightName,
		"MarketRightVisible": true
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
