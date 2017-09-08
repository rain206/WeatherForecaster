var searchBox, city, changed = 0, newQuery = false;
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

$(document.ready).ready(function () {
	getLocation();
})

//Gets the location of the user based on their IP address. 
function getLocation() {
	var location;
	$.ajax({
		format: "jsonp",
		dataType: "jsonp",
		url: "http://ip-api.com/json",
		success: function (data) {
			location = (data.lat + "," + data.lon);
			city = data.city;
			getForecast(location);
		},
		method: "GET"
	});
}

//Initializes the google maps search box
function initMap() {
	searchBox = new google.maps.places.SearchBox(document.getElementById('autocomplete'));

	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function () {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}
		newQuery = true;
	});
}

//Gets the city, and weather forecast for the location entered into the search box
function getWeather() {
	if (searchBox.getPlaces().length > 0)
	{
		var loc = searchBox.getPlaces().pop();
		var latLon = loc.geometry.location.lat() + "," + loc.geometry.location.lng();
		getCity(latLon);
		getForecast(latLon);
	}
	else {
		alert("Could not retrieve location. Please enter a new location");
	}
	newQuery = false;
}

//Gets the city location (latitude, longitude, name, etc.)
function getCity(latLon) {
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latLon + "&sensor=true";
	url = url.replace(/\s/g, "");
	$.ajax({
		format: "json",
		dataType: "json",
		url: url,
		success: function (data) {
			city = data.results[0].address_components[3].short_name;
		},
		method: "GET"
	})
	.error(function (jqXHR, textStatus, errorThrown) {
		alert("Could not retrieve city. Please enter a new location");
	})
}

//Gets the forecast for the location and changes the HTML accordingly.
function getForecast(latLon) {
	var url = "https://api.darksky.net/forecast/f6490d4ee8ea6131360e34e7570255d1/" + latLon;
	$.ajax({
		format: "jsonp",
		dataType: "jsonp",
		url: url,
		success: function (json) {
			var day = new Date();
			$("#weather-location").html('<b>' + days[day.getDay()] + ' in ' + city + '</b>');
			$("#weather-current").html(Math.round(json.currently.temperature) + "°");
			$("#weather-high").html("High: " + Math.round(json.daily.data[0].temperatureMax) + "°");
			$("#weather-low").html("Low: " + Math.round(json.daily.data[0].temperatureMin) + "°");
			$("#summary").html(json.daily.data[0].summary);

			for (var i = 1; i <= 6 && json.daily.data.length; i++)
			{
				var date = new Date();
				var newDate = new Date(date.setTime(date.getTime() + (i * 86400000)));
				$("#day" + i).html(days[newDate.getDay()]);

				if (changed == 1)
				{
					$("#day" + i).next().replaceWith(getWeatherIcon(json.daily.data[i].icon))
				}
				else {
					document.getElementById("day" + i).insertAdjacentHTML('afterend', getWeatherIcon(json.daily.data[i].icon));
				}

				$("#day" + i + "-high").html("High: " + Math.round(json.daily.data[i].temperatureMax));
				$("#day" + i + "-low").html("Low: " + Math.round(json.daily.data[i].temperatureMin));
			}
			changed = 1;
            historicalGraph(url);
            $("#info").show(1000);
			$("#forecast").show(1000);
		}
	})
	.error(function (jqXHR, textStatus, errorThrown) {
		alert("Forecast error. Please reenter your location");
	})
}

//Returns an HTML string to show a weather icon depending "icon". A sun will be displayed by default.
function getWeatherIcon(icon)
{
	if (icon.localeCompare('clear-night') == 0)
	{
		return '<i class=fa fa-star fa-2x aria-hidden="true"></i>';
	}
	else if (icon.localeCompare('rain') == 0)
	{
		return '<i class="fa fa-shower fa-2x" aria-hidden="true"></i>'
	}
	else if (icon.localeCompare('snow') == 0 || icon.localeCompare('sleet') == 0)
	{
		return '<i class="fa fa-snowflake-o fa-2x" aria-hidden="true"></i>'
	}
	else if (icon.localeCompare('fog') == 0 || icon.localeCompare('cloudy') == 0 || icon.localeCompare('partly-cloudy-day') == 0)
	{
		return '<i class="fa fa-cloud fa-2x" aria-hidden="true"></i>'
	}
	return '<i class="fa fa-sun-o fa-2x" aria-hidden="true"></i>'
}

//Initializes the variables for the graph.
function historicalGraph(url) {
    var xAxis = [];
    var yAxis = [];
    getData(url, 4, xAxis, yAxis);
}

//Recursively makes ajax calls to the DarkSky API to gather weather information for the past 5 years from today
function getData(url, i, xAxis, yAxis) {
    if (i < 0) {
        renderGraph(xAxis, yAxis);
        return;
    }

	var date = new Date();
	var history = new Date(date.setFullYear(date.getFullYear() - i));
	var query = url.concat("," + Math.round(history.getTime() / 1000));

	$.ajax({
		format: "jsonp",
		dataType: "jsonp",
		url: query,
		success: function (json) {
			var record = new Date(1970, 0, 1);
            record.setSeconds(json.daily.data[0].time);
            xAxis.push(record.getFullYear());
            yAxis.push(Math.round(json.daily.data[0].temperatureMax));
            getData(url, i - 1, xAxis, yAxis);
		}
	})
	.error(function (jqXHR, textStatus, errorThrown) {
		alert("Error retrieving forecast. Please reenter your location");
	})
}

//Renders a bar graph onto the DOM using Plotly
function renderGraph(xAxis, yAxis)
{
    var data = [
        {
            x: xAxis,
			y: yAxis,
			marker: {color: 'rgb(255, 212, 69)'},
            type: 'bar'
        }
    ]

    var layout = {
        title: 'Historical Temperatures On This Day',
        xaxis: {
            title: 'Year',
        },
        yaxis: {
            title: 'Degrees (F)'
		},
		paper_bgcolor: 'rgba(0, 0, 0, 0)',
		plot_bgcolor: 'rgba(0, 0, 0, 0)'
    };
    Plotly.newPlot('graph', data, layout);
    return;
}