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
	addAutoComplete();

	// if there was a graph context, display that graph
	displayNewMarketOnGraph($("#mname").text());
	displayError("There is an error!");


	setTimeout(function() {
		displayNewMarketOnGraph("BTC_ZRX_ETH");
	}, 5000);


	setInterval(function() {
		updateCurrentlyDisplayedGraphs();
	}, REFRESH);

});

function addAutoComplete() {
	$("#myInput").on('input', function() {
        console.log($(this).val());
    });
    $("#button").click(function() {
        $("#form1").attr("action",  "/g/" + $("#myInput").val());
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

	// CHANGE LATER
	var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

    autocomplete(document.getElementById("myInput"), countries);

}

function displayError(text) {
	$(".message-box").html("<div class='alert-red'>" + text + "<span class='closebtn'" + ">&times;</span></div>");
	$(".message-box")
		.css("display", "inline-block");
	$(".closebtn").click(function() {
		// this.parentElement.style.display = "none";
		$(".message-box").children("div.alert-red").remove();
	})
}


// creates SVG for the D3 line graph
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


// creates the D3 line graph
function createD3LineGraph() {

	$(".line").remove();
	$(".dots").remove();
	$(".dot").remove();

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

	svg.select(".x.axis").call(xAxis);
	svg.select(".y.axis").call(yAxis);
	svg.selectAll('path.line').attr('d', line);
	points.selectAll('circle').attr("transform", function(d) {
		return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
	);
}


// updates the line graph upon entry of new data
function updateD3LineGraph() {

	// line = d3.svg.line()
	//     .interpolate("linear")
	//     .x(function(d) { return x(parseInt(d.x)); })
	//     .y(function(d) { return y(d.y); });

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

	svg.select(".x.axis").call(xAxis);
	svg.select(".y.axis").call(yAxis);

	svg.selectAll('path.line').attr('d', line);
	points.selectAll('circle').attr("transform", function(d) {
		return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
	);
}


/*
 * Displays a new market on the graph if
 *   1. That market is not on the graph yet
 *	 2. There are fewer than MAX_MARKETS
 */
function displayNewMarketOnGraph(marketName) {

	/*
	if (allMarketNames.indexOf(marketName) < 0 ) {
		//TODO: display error message on page saying marketName is invalid
		displayError("Error! Market name is invalid.");
	}
	*/
	if (!displayedMarkets.hasOwnProperty(marketName)
		&& Object.keys(displayedMarkets).length < MAX_MARKETS) {

		getMarketNamesForMarket(marketName,
			getMarketNamesForMarketCallback);

	}
	else if (!displayedMarkets.hasOwnProperty(marketName)) {
		//TODO: display error message on page saying marketName has already been graphed
		displayError("Error! Market has already been graphed!");
	}
	else if (Object.keys(displayedMarkets).length < MAX_MARKETS) {
		//TODO: display error message on graph page saying maximum number of markets is already being displayed
		displayError("Error! Maximum amount of markets are already being displayed.");
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
		"end": "1530764579331"
	};
	getMarketDataForMarketInRange(marketRange, getMarketDataForMarketInRangeCallback);

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
