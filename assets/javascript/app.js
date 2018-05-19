

	// function that chanes xml to JSON
	function xmlToJson(xml) {
		
		// Create the return object
		var obj = {};

		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}return obj;
	};

	$("#cityInputForm").on("click", "#checkWeather-btn", function(event){
		event.preventDefault();

		$("#secondary-area").removeClass("hide");

		console.log("testing");
		var state = $("#selectState").val().trim();
		var city = $("#city-input").val().trim();
		var zip = $("#zip-input").val().trim();
		console.log(state);

		// Beginning Ajax call for Active Access
		var campsiteApiKey = "dnhsxuups2jvp66yevxeramm";
		var campsiteQueryUrl = "http://cors-everywhere.herokuapp.com/http://api.amp.active.com/camping/campgrounds?pstate=" + state + "&siteType=2003&api_key=" + campsiteApiKey;	


		if (state.length > 0 && city.length > 0 && zip.length === 5) {
		$.ajax({
			url: campsiteQueryUrl,
			method: "GET"
		}).then(function(response){
			// Changes XML to JSON
			var myObj = xmlToJson(response);
			console.log(myObj);
			//Pulling campsite name
			console.log(JSON.stringify(myObj.resultset.result[3]["@attributes"].facilityName));
			// Pulling campsite latitude
			console.log(JSON.stringify(myObj.resultset.result[3]["@attributes"].latitude));
			// Pulling campsite Longitude
			console.log(JSON.stringify(myObj.resultset.result[3]["@attributes"].longitude));
			var latitude = myObj.resultset.result[3]["@attributes"].latitude;
			var longitude = myObj.resultset.result[3]["@attributes"].longitude;

			window.latitude = latitude;
			window.longitude = longitude;

			var houseTR = $('<tr class="firstRow">');
			var tdName = $('<td>' + myObj.resultset.result[3]["@attributes"].facilityName + '</td>');
			houseTR.append(tdName);
			$('#campsiteList').prepend(houseTR);
			
			var googleURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&location_type=ROOFTOP&result_type=street_address&key=AIzaSyC3waa22L4Uh9nWzsVhpw9CId5Ud3k4atU';

			$.ajax({
				url: googleURL,
				method: "GET"
			}).then(function(response){
				console.log(response);
				console.log(response.results[0].formatted_address);
				var tdAddress = $('<td>' + response.results[0].formatted_address + '</td>')
				houseTR.append(tdAddress);										
			})
		})
		// Beginning Ajax call for weather API
		var weatherApiKey = "ba9485900797575aadc3a1081bfa14f7";
		var weatherQueryUrl = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&zip=" + zip + "&APPID=" + weatherApiKey; 
		
		$.ajax({
			url: weatherQueryUrl,
			method: "GET"
		}).then(function(response){
			var weatherObj = response;
			console.log(weatherObj);
			// This forloop is checking today's and the next 5 day's weather
			for(var i=0; i<weatherObj.list.length; i++){
				if (i === 0 || i === 2 || i === 10 || i === 18 || i === 26 || i === 34){
				console.log(weatherObj.list[i].main.temp);
				// pulling today's high temperature
				console.log(weatherObj.list[i].main.temp_max);
				// pulling today's low temp
				console.log(weatherObj.list[i].main.temp_min);
				// Pulling wind speed
				console.log(weatherObj.list[i].wind.speed);
				// pulling forecast
				console.log(weatherObj.list[i].weather[0].description);
				//pulling city name
				console.log(weatherObj.city.name);}
			}

            //To convert from Kelvin to Fahrenheit: F = (K - 273.15) * 1.80 + 32
            var tempK = weatherObj.list[0].main.temp;
            // render weather info into Weather table
            var wCity = weatherObj.city.name;
            var wTemp = Math.round((tempK - 273.15) * 1.80 + 32);
            var wWind = weatherObj.list[0].wind.speed;
            var wForecast = weatherObj.list[0].weather[0].description;

            //session storage
            sessionStorage.clear();

            // Store all content into sessionStorage
            sessionStorage.setItem("wCity", wCity);
            sessionStorage.setItem("wTemp", wTemp);
            sessionStorage.setItem("wWind", wWind);
            sessionStorage.setItem("wForecast", wForecast);


            var wCity = $("#w_City").text(sessionStorage.getItem("wCity"));
            var wTemp = $("#w_Temp").text(sessionStorage.getItem("wTemp"));
            var wWind = $("#w_Wind").text(sessionStorage.getItem("wWind"));
            var wForecast = $("#w_Forecast").text(sessionStorage.getItem("wForecast"));
		});
	}});
