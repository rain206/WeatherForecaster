var searchBox, city, changed = 0, darkSky, darkSkyUrl;
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var historicalData = [];

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
	darkSkyUrl = "https://api.darksky.net/forecast/25da0162a3bbb222ed3f144eaabade8d/" + latLon;
	$.ajax({
		format: "jsonp",
		dataType: "jsonp",
		url: darkSkyUrl,
		success: function (json) {
			darkSky = json;
			var day = new Date();
			$("#weather-location").html('<b>' + days[day.getDay()] + ' in ' + city + '</b>');
			$("#weather-current").html(Math.round(json.currently.temperature) + "°");
			$("#weather-high").html("High: " + Math.round(json.daily.data[0].temperatureMax) + "°");
			$("#weather-low").html("Low: " + Math.round(json.daily.data[0].temperatureMin) + "°");
			$("#summary").html(json.daily.data[0].summary);
			$("#iconToday").replaceWith(getWeatherIcon(json.hourly.data[0].icon).replace("32px", "92px"));

			for (var i = 1; i < 7 && json.daily.data.length; i++)
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
			getPastData(darkSkyUrl, 4)
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
		return '<i class="wi wi-night-clear" style="font-size: 32px"></i>';
	}
	else if (icon.localeCompare('rain') == 0)
	{
		return '<i class="wi wi-rain" style="font-size: 32px"></i>';
	}
	else if (icon.localeCompare('snow') == 0 || icon.localeCompare('sleet') == 0)
	{
		return '<i class="wi wi-snow" style="font-size: 32px"></i>';
	}
	else if (icon.localeCompare('fog') == 0 || icon.localeCompare('cloudy') == 0 || icon.localeCompare('partly-cloudy-day') == 0)
	{
		return '<i class="wi wi-day-fog" style="font-size: 32px"></i>';
	}
	return '<i class="wi wi-day-sunny" style="font-size: 32px"></i>'
}

//Recursively makes ajax calls to the DarkSky API to gather weather information for the past 5 years from today
function getPastData(url, yearsBack) {
    if (yearsBack < 0) {
        renderGraph(0);
        return;
    }
	var date = new Date();
	var history = new Date(date.setFullYear(date.getFullYear() - yearsBack - 1));
	var query = url.concat("," + Math.round(history.getTime() / 1000));

	$.ajax({
		format: "jsonp",
		dataType: "jsonp",
		url: query,
		success: function (json) {
			historicalData.push(json);
            getPastData(url, yearsBack - 1);
		}
	})
	.error(function (jqXHR, textStatus, errorThrown) {
		alert("Error retrieving forecast. Please try again");
	})
}

//Renders a bar graph onto the DOM using Plotly
function renderGraph(hash)
{
	var xAxis = [];
	var yAxis = [];
	for (var i = 0; i < historicalData.length; i++)
	{
		var year = new Date(1970, 0, 1);
		year.setSeconds(historicalData[i].daily.data[0].time);
		xAxis.push(year.getFullYear());

		switch (hash) {
			case 0: yAxis.push(Math.round(historicalData[i].daily.data[0].temperatureMax));
				break;
			case 1: yAxis.push(Math.round(historicalData[i].daily.data[0].temperatureMin));
				break;
			case 2: yAxis.push(Math.round(historicalData[i].daily.data[0].windSpeed));
				break;
			case 3: yAxis.push(historicalData[i].daily.data[0].precipIntensity);
				break;
			default: break;
		}
	}


    var data = [
        {
            x: xAxis,
			y: yAxis,
			marker: {color: 'rgb(255, 212, 69)'},
            type: 'bar'
        }
    ]

	var arr = getGraphTitles(hash);

    var layout = {
        title: arr[0],
        xaxis: {
            title: 'Year',
        },
        yaxis: {
            title: arr[1],
		},
		paper_bgcolor: 'rgba(0, 0, 0, 0)',
		plot_bgcolor: 'rgba(0, 0, 0, 0)'
    };
    Plotly.newPlot('graph', data, layout);
    return;
}

//Gets the title for the graph based on the hash value passed in.
function getGraphTitles(hash)
{
	var arr = [];
	switch (hash) {
		case 0: arr.push('Historical Maximum Temperatures On This Day');
			arr.push('Degrees (F)');
			break;

		case 1: arr.push('Historical Minimum Temperatures On This Day');
			arr.push('Degrees (F)');
			break;

		case 2: arr.push('Historical Wind Speeds On This Day');
			arr.push('Miles Per Hour');
			break;

		case 3: arr.push('Historical Precipitation Intensity On This Day');
			arr.push('Millimeters Per Hour');
			break;

		default: ['5 Year Historical Data', 'Degrees (F)', 'maxTempGraph']
			break;;
	}
	return arr;
}


//Sends a pop-up with more information about the weather for the day
function moreInfo()
{
	if (darkSky)
	{
		var msg = "";
		msg = msg.concat("Maximum Temperature: " + darkSky.daily.data[0].temperatureMax + "\n");
		msg = msg.concat("Minimum Temperature: " + darkSky.daily.data[0].temperatureMin + "\n");
		msg = msg.concat("Wind Speed: " + darkSky.daily.data[0].windSpeed + "\n");
		msg = msg.concat("Precipitation: " + darkSky.daily.data[0].precipIntensity + "\n");
		msg = msg.concat("Humidity: " + darkSky.daily.data[0].humidity + "\n");
		msg = msg.concat("Pressure: " + darkSky.daily.data[0].pressure + "\n");
		msg = msg.concat("Ozone: " + darkSky.daily.data[0].ozone + "\n");
		msg = msg.concat("Visibility: " + darkSky.daily.data[0].visibility + "\n");
		alert(msg);
	}
	else
	{
		alert("Please enter a location"); ''
	}
}