var autocomplete;
var place;
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var city;
var changed = 0;

$(document.ready).ready(function () {
	getLocation();
})

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

function initMap() {
	var acOptions = {
		types: ['establishment']
	};

	autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), acOptions);

	google.maps.event.addListener(autocomplete, 'place_changed', function () {
		place = autocomplete.getPlace();
	});
}

function getWeather() {
	var loc = autocomplete.getPlace();
	var latLon = loc.geometry.location.lat() + "," + loc.geometry.location.lng();
	getCity(latLon);
	getForecast(latLon);
}

function getCity(latLon) {
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latLon + "&sensor=true";
	url = url.replace(/\s/g, "");
	$.ajax({
		format: "json",
		dataType: "json",
		url: url,
		success: function (data) {
			city = data.results[0].address_components[3].long_name
		},
		method: "GET"
	});
}

function getForecast(latLon) {
	var url = "https://api.darksky.net/forecast/25da0162a3bbb222ed3f144eaabade8d/" + latLon;
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

function historicalGraph(url) {
    var xAxis = [];
    var yAxis = [];
    getData(url, 4, xAxis, yAxis);
}

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