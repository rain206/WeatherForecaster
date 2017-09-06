var autocomplete;
var place;
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
	var latLon = loc.geometry.location.lat() + ", " + loc.geometry.location.lng();
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
			$('#weather-location').html(data.results[0].address_components[2].long_name);
		},
		method: "GET"
	});
}

function getForecast(latLon) {
	var url = "https://api.darksky.net/forecast/f6490d4ee8ea6131360e34e7570255d1/" + latLon;
	$.ajax({
		format: "jsonp",
		dataType: "jsonp",
		url: url,
		success: function (json) {
			$("#weather-current").html(Math.round(json.currently.temperature) + "°");
			$("#weather-high").html("High: " + Math.round(json.daily.data[2].temperatureMax) + "°");
			$("#weather-low").html("Low: " + Math.round(json.daily.data[1].temperatureMin) + "°");
			$("#summary").html(json.daily.data[1].summary);

			for (var i = 1; i <= 6; i++)
			{
				var date = new Date();
				var newDate = new Date(date.setTime(date.getTime() + (i * 86400000)));
				$("#day" + i).html(days[newDate.getDay()] + ":")
				$("#day" + i + "-high").html("High: " + Math.round(json.daily.data[i].temperatureMax))
				$("#day" + i + "-low").html("Low: " + Math.round(json.daily.data[i].temperatureMin));
			}
            historicalGraph(url);
            $("#info").show(1000);
			$("#forecast").show(1000);
		}
	})
	.error(function (jqXHR, textStatus, errorThrown) {
		alert("Forecast error. Please reenter your location");
	})
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
            //data = data.concat(record.getFullYear() + "," + Math.round(json.daily.data[0].temperatureMax) + "\n"); 
            getData(url, i - 1, xAxis, yAxis);
		}
	})
	.error(function (jqXHR, textStatus, errorThrown) {
		counter = counter + 1;
		alert("Error retrieving forecast. Please reenter your location");
	})
}

function renderGraph(xAxis, yAxis)
{
    var data = [
        {
            x: xAxis,
            y: yAxis,
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
        }
    };
    Plotly.newPlot('graph', data, layout);
    return;
}