/* graph.js */


// Maximum number of displayable graphs
const MAX_MARKETS = 5;

// Refresh rate
const REFRESH = 10000;

// List of all possible graphs
var allMarketNames = [];

// Contains graphs currently being displayed
var displayedMarkets = {};

// Contains raw graph data for graphing in D3
var graphData = [];

// Track next available position in graph data
var graphPos = 0;

// variables for tracking D3 graph
var colors = [
	'steelblue',
	'green',
	'red',
	'purple'
];
var svg = null;
var line = null;
var points = null;
var x, y, xAxis, yAxis;
var margin = {top: 20, right: 30, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


$(document).ready(function() {

	// add all the market names to the dropdown
	addMarketNamesToDropdown();

	setTimeout(1000);
	// if there was a graph context, display that graph
	displayNewMarketOnGraph($("#mname").val());

	setInterval(function() {
		updateCurrentlyDisplayedGraphs();
	}, REFRESH);

});


function createD3SVG() {

	x = d3.time.scale()
	    .domain([ parseInt(graphData[0][0].x), parseInt(Date.now()) ])
	    .range([0, width]);

	y = d3.scale.linear()
	    .domain([0.85, 1.05])
	    .range([height, 0]);

	xAxis = d3.svg.axis()
	    .scale(x)
		.tickSize(-height)
		.tickPadding(10)
		.tickSubdivide(true)
	    .orient("bottom");

	yAxis = d3.svg.axis()
	    .scale(y)
		.tickPadding(10)
		.tickSize(-width)
		.tickSubdivide(true)
	    .orient("left");

	var zoom = d3.behavior.zoom()
	    .x(x)
	    .y(y)
	    .scaleExtent([1, 1000])
	    .on("zoom", zoomed);


	svg = d3.select("body").append("svg")
		.call(zoom)
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	    //.attr('id', 'canvas');

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis);

	svg.append("g")
		.attr("class", "y axis")
		.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("y", (-margin.left) + 10)
		.attr("x", -height/2)
		.text('Axis Label');

	svg.append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", width)
		.attr("height", height);
}


function createD3LineGraph() {

	//************************************************************
	// Create D3 line object and draw data on our SVG object
	//************************************************************
	line = d3.svg.line()
	    .interpolate("linear")
	    .x(function(d) { return x(parseInt(d.x)); })
	    .y(function(d) { return y(d.y); });

	svg.selectAll('.line')
		.data(graphData)
		.enter()
		.append("path")
	    .attr("class", "line")
		.attr("clip-path", "url(#clip)")
		.attr('stroke', function(d,i){
			return colors[i%colors.length];
		})
	    .attr("d", line);


	//************************************************************
	// Draw points on SVG object based on the data given
	//************************************************************
	points = svg.selectAll('.dots')
		.data(graphData)
		.enter()
		.append("g")
	    .attr("class", "dots")
		.attr("clip-path", "url(#clip)");

	points.selectAll('.dot')
		.data(function(d, index){
			var a = [];
			d.forEach(function(point,i){
				a.push({'index': index, 'point': point});
			});
			return a;
		})
		.enter()
		.append('circle')
		.attr('class','dot')
		.attr("r", 2.5)
		.attr('fill', function(d,i){
			return colors[d.index%colors.length];
		})
		.attr("transform", function(d) {
			return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
		);

}



function updateD3LineGraph() {

}


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
			"start": "1530764467248",
			"end": "1530764584163"
		};
		getMarketDataForMarketInRange(marketRange, getMarketDataForMarketInRangeCallback);


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
			"start": parseInt(displayedMarkets[key].lastTimestamp) + 1,
			"end": Date.now()
		};
		getMarketDataForMarketInRange(marketRange, getMarketDataForMarketInRangeAppendCallback);

		//TODO: update data points in the D3 graph
	});
}


// Removes market from the graph
function removeMarketFromGraph(marketName) {

	delete displayedMarkets[marketName];

	var decrementPoint = displayedMarkets[marketName].graphDataPosRight;

	delete graphData[displayedMarkets[marketName].graphDataPosLeft];
	delete graphData[decrementPoint];

	displayedMarkets.forEach( function(item) {
		if (item.graphDataPosLeft > decrementPoint) item.graphDataPosLeft -= 2;
		if (item.graphDataPosRight > decrementPoint) item.graphDataPosRight -= 2;
	});
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

/*
 * Handler for zooming in and out on the graph
 */
function zoomed() {
	svg.select(".x.axis").call(xAxis);
	svg.select(".y.axis").call(yAxis);
	svg.selectAll('path.line').attr('d', line);

	points.selectAll('circle').attr("transform", function(d) {
		return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
	);
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

	var left = [];
	var right = [];

	var lastT;

	data[key].forEach(function(item) {
		left.push({'x': item.DataTimestamp, 'y': item.LeftVal});
		right.push({'x': item.DataTimestamp, 'y': item.RightVal});

		lastT = item.DataTimestamp;

		// console.log(item);
		// console.log("Data " + item.DataTimestamp + "  " + item.LeftVal + "  " + item.RightVal);
	});

	displayedMarkets[key].lastTimestamp = lastT;
	displayedMarkets[key].graphDataPosLeft = graphPos;
	graphPos += 1;
	displayedMarkets[key].graphDataPosRight = graphPos;
	graphPos += 1;

	graphData.push(left);
	graphData.push(right);

	console.log(graphData);

	if (svg == null) createD3SVG();

	createD3LineGraph();
}


/*
 * Callback for appending new market data
 */
function getMarketDataForMarketInRangeAppendCallback(data) {

	var key = Object.keys(data)[0];

	if (data[key].length > 0) {

		var lastT;

		data[key].forEach(function(item) {

			graphData[displayedMarkets[key].graphDataPosLeft].push({'x': item.DataTimestamp, 'y': item.LeftVal});
			graphData[displayedMarkets[key].graphDataPosRight].push({'x': item.DataTimestamp, 'y': item.RightVal});

			lastT = item.DataTimestamp;
		});

		displayedMarkets[key].lastTimestamp = lastT;

		updateD3LineGraph();
	}
}


/*
 * Callback for getting the left and right names for a market
 */
function getMarketNamesForMarketCallback(data) {

	displayedMarkets[data.MarketChainName] = {
		"MarketLeftName": data.MarketLeftName,
		"MarketLeftVisible": true,
		"MarketRightName": data.MarketRightName,
		"MarketRightVisible": true,
		"lastTimestamp": Date.now()
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
