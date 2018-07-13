/* graph.js */


// Maximum number of displayable graphs
const MAX_MARKETS = 5;

// Refresh rate
const REFRESH = 10000;  // 10 seconds

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
	'#0000ff', // blue
	'#00d0ff', // light blue
	'#ff0000', // red
	'#ff358c', // pink
	'#ff6100', // orange
	'#ff9900', // light orange
	'#056d16', // green
	'#00d323', // light green
	'#000000', // black
	'#666666'  // grey
];
var svg = null;
var line = null;
var points = null;
var x, y, xAxis, yAxis;
var margin = {top: 20, right: 30, bottom: 30, left: 70},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;



$(document).ready(function() {

	// add all the market names to the dropdown
	addMarketNamesToSearch();

	setInterval(function() {
		updateCurrentlyDisplayedGraphs();
	}, REFRESH);

});


// Gets all market names and adds them all to the dropdown for the user to select
function addMarketNamesToSearch() {

	getAllValidMarketNames(getAllValidMarketNamesCallback);
}


// Adds autocomplet functionality to the search bar
function addAutoCompleteToSearch() {
	$("#myInput").on('input', function() {

        // console.log($(this).val());
    });
    $("#addbutton").click(function() {

		displayNewMarketOnGraph($("#myInput").val().toUpperCase());
    });
    $("#removebutton").click(function() {

		removeMarketFromGraph($("#myInput").val().toUpperCase());
    });

	function autocomplete(inp, arr) {
		var currentFocus;

		inp.addEventListener("input", function(e) {
			var a, b, i, val = this.value;
			// Close list of auto-completed values
			closeAllLists();
			if (!val) { return false;}
			currentFocus = -1;

			a = document.createElement("DIV");
			a.setAttribute("id", this.id + "autocomplete-list");
			a.setAttribute("class", "autocomplete-items");
			this.parentNode.appendChild(a);

			for (i = 0; i < arr.length; i++) {

				if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
					// Create a div for a matching element
					b = document.createElement("DIV");
					b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
					b.innerHTML += arr[i].substr(val.length);
					b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";

					// When someone clicks on the item:
					b.addEventListener("click", function(e) {
						inp.value = this.getElementsByTagName("input")[0].value;
						closeAllLists();
					});
					a.appendChild(b);
				}
			}
		});

		// Listens for keydown inputs (when user presses a key)
		inp.addEventListener("keydown", function(e) {

			var x = document.getElementById(this.id + "autocomplete-list");
			if (x) x = x.getElementsByTagName("div");
			if (e.keyCode == 40) { // DOWN
				currentFocus++;
				addActive(x);
			} else if (e.keyCode == 38) { // UP
				currentFocus--;
				addActive(x);
			} else if (e.keyCode == 13) { // ENTER
				e.preventDefault();
				if (currentFocus > -1) {
					  // Simulate a click
					  if (x) x[currentFocus].click();
				}
			}
		});

		function addActive(x) {
			if (!x) return false;
			removeActive(x);
			if (currentFocus >= x.length) currentFocus = 0;
			if (currentFocus < 0) currentFocus = (x.length - 1);
				x[currentFocus].classList.add("autocomplete-active");
		}

		function removeActive(x) {
			for (var i = 0; i < x.length; i++) {
			  x[i].classList.remove("autocomplete-active");
			}
		}

		function closeAllLists(elmnt) {
			var x = document.getElementsByClassName("autocomplete-items");
			for (var i = 0; i < x.length; i++) {
				if (elmnt != x[i] && elmnt != inp) {
					x[i].parentNode.removeChild(x[i]);
				}
			}
		}
		document.addEventListener("click", function (e) {
			closeAllLists(e.target);
		});
	}

	autocomplete(document.getElementById("myInput"), allMarketNames);
}



/*
 * Displays a new market on the graph if
 *   1. That market is not on the graph yet
 *	 2. There are fewer than MAX_MARKETS
 */
function displayNewMarketOnGraph(marketName) {

	if (allMarketNames.indexOf(marketName) < 0 ) {
		
		displayError("Error! Market " + marketName + " is invalid and can't be added.");
		return;
	}

	if (!displayedMarkets.hasOwnProperty(marketName)
		&& Object.keys(displayedMarkets).length < MAX_MARKETS) {

		getMarketNamesForMarket(marketName,
			getMarketNamesForMarketCallback);

	}
	else if (displayedMarkets.hasOwnProperty(marketName)) {

		displayError("Error! Market " + marketName + " has already been graphed!");
	}
	else if (Object.keys(displayedMarkets).length >= MAX_MARKETS) {

		displayError("Error! Maximum amount of markets are already being displayed.");
	}

}


// Updates all of the currently displayed
function updateCurrentlyDisplayedGraphs() {

	Object.keys(displayedMarkets).forEach( function(key) {

		if (!isNaN(parseInt(displayedMarkets[key].lastTimestamp))) {
			var marketRange = {
				"marketname": key,
				"start": parseInt(displayedMarkets[key].lastTimestamp) + 1,
				"end": Date.now()
			};
			getMarketDataForMarketInRange(marketRange, getMarketDataForMarketInRangeAppendCallback);
		}
	});
}


// Removes market from the graph
function removeMarketFromGraph(marketName) {

	if (allMarketNames.indexOf(marketName) < 0 ) {
		//TODO: display error message on page saying marketName is invalid
		displayError("Error! Market " + marketName + " is invalid and can't be removed.");
		return;
	}
	else if (!displayedMarkets.hasOwnProperty(marketName)) {
		displayError("Error! Market " + marketName + " has not been graphed yet!");
		return;
	}

	var decrementPoint = displayedMarkets[marketName].graphDataPosRight;

	// remove data from the graphData
	graphData.splice(decrementPoint - 1, 2);
	graphPos -= 2;

	// recycle the colors so they don't disturb the order of the current graph and can be reused for future graph
	var colorLeft = colors[decrementPoint - 1];
	var colorRight = colors[decrementPoint];
	colors.splice(decrementPoint - 1, 2);
	colors.push(colorLeft);
	colors.push(colorRight);

	// graphs added after the removed graph have shifted up 2 in the graphData array; update positions
	Object.keys(displayedMarkets).forEach( function(key) {
		if (displayedMarkets[key].graphDataPosLeft > decrementPoint)
			displayedMarkets[key].graphDataPosLeft -= 2;

		if (displayedMarkets[key].graphDataPosRight > decrementPoint)
			displayedMarkets[key].graphDataPosRight -= 2;
	});

	delete displayedMarkets[marketName];

	createD3LineGraph();
}



/*****************************************************************************
 * D3 Functions ----- START ------
 *****************************************************************************/

// creates SVG for the D3 line graph
function createD3SVG() {

	var xDomainLeft = parseInt(graphData[0][0].x) -
		(parseInt(Date.now()) - parseInt(graphData[0][0].x));

	x = d3.time.scale()
	    .domain([ xDomainLeft, parseInt(Date.now()) + 1000000 ])
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
	    .scaleExtent([1, 2000])
	    .on("zoom", zoomed);

	svg = d3.select("#svg-wrapper").append("svg")
		.call(zoom)
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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


// creates/recreates the D3 line graph
function createD3LineGraph() {

	$(".line").remove();
	$(".dots").remove();
	$(".dot").remove();

	// Create D3 line object and draw data on our SVG object
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

	// Draw points on SVG object based on the data given
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

	svg.selectAll('path.line').attr('d', line);
	points.selectAll('circle').attr("transform", function(d) {
		return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
	);
}


// updates the line graph upon entry of new data
function updateD3LineGraph() {

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

	svg.selectAll('path.line').attr('d', line);
	points.selectAll('circle').attr("transform", function(d) {
		return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
	);
}

/*****************************************************************************
 * D3 Functions ----- END ------
 *****************************************************************************/



/*****************************************************************************
 * Handler Functions ----- START ------
 *****************************************************************************/

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


/*
 * Handler for displaying errors
 */
function displayError(text) {
	$(".message-box").html("<div class='alert-red'>" + text + "<span class='closebtn'" + ">&times;</span></div>");
	$(".message-box")
		.css("display", "inline-block");
	$(".closebtn").click(function() {
		$(".message-box").children("div.alert-red").remove();
	})
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

	if (data[key].length < 1) {
		displayError("Market " + key + " has no data!");
		delete displayedMarkets[key];
		return;
	}

	data[key].forEach(function(item) {
		left.push({'x': item.DataTimestamp, 'y': item.LeftVal});
		right.push({'x': item.DataTimestamp, 'y': item.RightVal});

		lastT = item.DataTimestamp;
	});

	displayedMarkets[key].lastTimestamp = lastT;
	displayedMarkets[key].graphDataPosLeft = graphPos;
	graphPos += 1;
	displayedMarkets[key].graphDataPosRight = graphPos;
	graphPos += 1;

	graphData.push(left);
	graphData.push(right);

	if (svg == null) {
		createD3SVG();
	}
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

	var marketRange = {
		"marketname": data.MarketChainName,
		"start": "1530664467249",
		"end":   Date.now()
	};
	getMarketDataForMarketInRange(marketRange, getMarketDataForMarketInRangeCallback);
}


/* Callback for getting all possible market chain names
 *
 */
function getAllValidMarketNamesCallback(data) {

	allMarketNames = data.sort();

	// if there was a context, display the graph clicked from the main table
	if ($("#mname").text().length > 0) {
		displayNewMarketOnGraph($("#mname").text());
	}

	// add autocomplete functionality to the dropdown
	addAutoCompleteToSearch();
}

/*****************************************************************************
 * Callback Functions ----- END ------
 *****************************************************************************/
