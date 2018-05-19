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
	}
	return obj;
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
	var campsiteQueryUrl = "http://cors-everywhere.herokuapp.com/http://api.amp.active.com/camping/campgrounds?pstate=" + state + "&api_key=" + campsiteApiKey;	


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

		var houseTR = $('<tr class="firstRow">')
		var tdName = $('<td>' + myObj.resultset.result[3]["@attributes"].facilityName + '</td>')
		houseTR.append(tdName)
		$('#campsiteList').prepend(houseTR)
		
		var googleURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&location_type=ROOFTOP&result_type=street_address&key=AIzaSyC3waa22L4Uh9nWzsVhpw9CId5Ud3k4atU';

		$.ajax({
			url: googleURL,
			method: "GET"
		}).then(function(response){
			console.log(response);
			console.log(response.results[0].formatted_address);
			var tdAddress = $('<td>' + response.results[0].formatted_address + '</td>')
			houseTR.append(tdAddress)

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
		// pulling temparrature
		console.log(weatherObj.list[0].main.temp)
		// Pulling wind speed
		console.log(weatherObj.list[0].wind.speed)
		// pulling forecast
		console.log(weatherObj.list[0].weather[0].description)
	 
		

	 })
	}	  

	})


