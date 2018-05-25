//hide non input fields on window load
window.onload = function(){
	$('.moreInfo').hide();
	$('.coldlist').hide();
	$('.hotlist').hide();
}
// function that changes xml to JSON
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

//on submit button click test to see if user input fits all criteria
$("#cityInputForm").on("click", "#checkWeather-btn", function(event){
	event.preventDefault();
	//assign exprexxions to test input type
	var nameReg = /^[A-Za-z ]+$/;
	var numberReg =  /^[0-9]+$/;

	//setting validity of each input to false
	var validCity = false;
	var validZip = false;
	var validState = false;

	//check if city field is blank or contains a non letter character
	//else city is valid = true
	var city = $("#city-input").val().trim();
	if(city == ""){
		$('#formErrorCity').text(' ' + 'Please enter ' +' ' );
	} 
	else if(!nameReg.test(city)){
		$('#formErrorCity').text(' ' + ' Letters only for '+ ' ' );
	}
	else{
		$(".city-error").remove();
		validCity = true;
	}

	//check if zip field blank,contains a non number or is shorter than 5 numbers
	//else zip is valid = true
	var zip = $("#zip-input").val().trim();
	if(zip == ""){
		$('#formErrorZip').text(' ' + 'Please enter ' +' ' );
	}
	else if(!numberReg.test(zip)){
		$('#formErrorZip').text(' ' + ' Numbers only for '+ ' ' );
	}
	else if(zip.length !== 5){
		$('#formErrorZip').text(' ' + ' Please enter valid' + ' ');
	}
	else{
		$(".zip-error").remove();
		validZip = true;
	}
	
	//check if state is blank
	//else state is valid = true
	var state = $("#selectState").val().trim();
	if(state == ""){
		$('#formErrorState').text(' ' + 'Please ' +' ');
	} 
	else{
		$(".state-error").remove();
		validState = true;
	}
	// Beginning Ajax call for Active Access
	var campsiteApiKey = "dnhsxuups2jvp66yevxeramm";
	var campsiteQueryUrl = "https://cors-everywhere.herokuapp.com/http://api.amp.active.com/camping/campgrounds?pstate=" + state + "&siteType=2003&api_key=" + campsiteApiKey;	


	if( validCity && validState && validZip ){
		$("#secondary-area").removeClass("hide");
		$(".error").empty();

		//call the campsite API
		$.ajax({
			url: campsiteQueryUrl,
			method: "GET"
		}).then(function(response){

			// Changes XML to JSON
			var myObj = xmlToJson(response);

			for(var i=0; i < 5; i++){
				
				let latitude = myObj.resultset.result[i]["@attributes"].latitude;
				let longitude = myObj.resultset.result[i]["@attributes"].longitude;
				let campSiteName= myObj.resultset.result[i]["@attributes"].facilityName;
				window.latitude = latitude;
				window.longitude = longitude;								
				var googleURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&location_type=ROOFTOP&result_type=street_address&key=AIzaSyC3waa22L4Uh9nWzsVhpw9CId5Ud3k4atU';


				$.ajax({
					url: googleURL,
					method: "GET"
				}).then(function(response){
					console.log(response);
					//console.log("TEST" + response.results[0].address_components[6].long_name);
					var zipCode = response.results[0].address_components[6].long_name;
					// console.log(response.results[0].formatted_address);
					var mapQuery = (response.results[0].formatted_address).replace(/ /g , "+");						
					var tdAddress = response.results[0].formatted_address;	
					var houseTr = (`<tr><td><a class='nameButton' data-Zipcode=${zipCode}>` + campSiteName + "<p class='hoverMagic'>click to view weather</p>" + "</a></td><td><a href='https://maps.google.com/?q=" + mapQuery + "'target='_blank'>" + tdAddress + "</a></td></tr>")
					$('#campsiteList').append(houseTr);
				})
			}								
		})
	


	$("#campsiteList").on("click", ".nameButton", function(){
		event.preventDefault();
		var currentZip = $(this).attr("data-zipCode");

	// Beginning Ajax call for weather API
			var weatherApiKey = "ba9485900797575aadc3a1081bfa14f7";
			var weatherQueryUrl = "http://api.openweathermap.org/data/2.5/forecast?zip=" + currentZip + "&APPID=" + weatherApiKey; 
			// Moment.js functions to assign correct days to the weather display
			//format as day of week and day of month with ordinal. Add days and format
			var today = moment().format("ddd, Do");
			$(".day-1").text(today);
			$(".day-2").text(moment().add(1 ,"days").format("ddd, Do"));
			$(".day-3").text(moment().add(2 ,"days").format("ddd, Do"));
			$(".day-4").text(moment().add(3 ,"days").format("ddd, Do"));
			$(".day-5").text(moment().add(4 ,"days").format("ddd, Do"));			
			
			$.ajax({
				url: weatherQueryUrl,
				method: "GET"
			}).then(function(response){
				console.log("working")
				var weatherObj = response;
				console.log(weatherObj);
				// This forloop is checking today's and the next 5 day's weather
				for(var i=0; i<weatherObj.list.length; i++){

					//rendering in to Wheather Table for one day
					if(i===0){
						var city = weatherObj.city.name;
						var tempCurrentK = weatherObj.list[i].main.temp;
						var tempCurrentF = Math.round((tempCurrentK - 273.15) * 1.80 + 32);
						var tempMaxK = weatherObj.list[i].main.temp_max;
						var tempMaxF = Math.round((tempMaxK - 273.15) * 1.80 + 32);
						var tempMinK = weatherObj.list[i].main.temp_min;
						var tempMinF = Math.round((tempMinK - 273.15) * 1.80 + 32);
						var wind = weatherObj.list[i].wind.speed;
						var forecast = weatherObj.list[i].weather[0].description;
						
						$("#tempC0").empty();
						$("#tempH0").empty();
						$("#tempL0").empty();
						$("#wind0").empty();
						$("#for0").empty();
						$("#tempC0").append(Math.round((tempCurrentK - 273.15) * 1.80 + 32));
						$("#tempH0").append(Math.round((tempMaxK - 273.15) * 1.80 + 32));
						$("#tempL0").append(Math.round((tempMinK - 273.15) * 1.80 + 32));
						$("#wind0").append(weatherObj.list[i].wind.speed);
						$("#for0").append(weatherObj.list[i].weather[0].description);
						
					}else if(i===2){
						var city = weatherObj.city.name;
						var tempCurrentK = weatherObj.list[i].main.temp;
						var tempCurrentF = Math.round((tempCurrentK - 273.15) * 1.80 + 32);
						var tempMaxK = weatherObj.list[i].main.temp_max;
						var tempMaxF = Math.round((tempMaxK - 273.15) * 1.80 + 32);
						var tempMinK = weatherObj.list[i].main.temp_min;
						var tempMinF = Math.round((tempMinK - 273.15) * 1.80 + 32);
						var wind = weatherObj.list[i].wind.speed;
						var forecast = weatherObj.list[i].weather[0].description;
						
						$("#tempC2").empty();
						$("#tempH2").empty();
						$("#tempL2").empty();
						$("#wind2").empty();
						$("#for2").empty();
						$("#tempC2").append(Math.round((tempCurrentK - 273.15) * 1.80 + 32));
						$("#tempH2").append(Math.round((tempMaxK - 273.15) * 1.80 + 32));
						$("#tempL2").append(Math.round((tempMinK - 273.15) * 1.80 + 32));
						$("#wind2").append(weatherObj.list[i].wind.speed);
						$("#for2").append(weatherObj.list[i].weather[0].description);
						
					}else if(i===10){
						var city = weatherObj.city.name;
						var tempCurrentK = weatherObj.list[i].main.temp;
						var tempCurrentF = Math.round((tempCurrentK - 273.15) * 1.80 + 32);
						var tempMaxK = weatherObj.list[i].main.temp_max;
						var tempMaxF = Math.round((tempMaxK - 273.15) * 1.80 + 32);
						var tempMinK = weatherObj.list[i].main.temp_min;
						var tempMinF = Math.round((tempMinK - 273.15) * 1.80 + 32);
						var wind = weatherObj.list[i].wind.speed;
						var forecast = weatherObj.list[i].weather[0].description;
						$("#tempC10").empty();
						$("#tempH10").empty();
						$("#tempL10").empty();
						$("#wind10").empty();
						$("#for10").empty();
						$("#tempC10").append(Math.round((tempCurrentK - 273.15) * 1.80 + 32));
						$("#tempH10").append(Math.round((tempMaxK - 273.15) * 1.80 + 32));
						$("#tempL10").append(Math.round((tempMinK - 273.15) * 1.80 + 32));
						$("#wind10").append(weatherObj.list[i].wind.speed);
						$("#for10").append(weatherObj.list[i].weather[0].description);
						
					}else if(i===18){
						var city = weatherObj.city.name;
						var tempCurrentK = weatherObj.list[i].main.temp;
						var tempCurrentF = Math.round((tempCurrentK - 273.15) * 1.80 + 32);
						var tempMaxK = weatherObj.list[i].main.temp_max;
						var tempMaxF = Math.round((tempMaxK - 273.15) * 1.80 + 32);
						var tempMinK = weatherObj.list[i].main.temp_min;
						var tempMinF = Math.round((tempMinK - 273.15) * 1.80 + 32);
						var wind = weatherObj.list[i].wind.speed;
						var forecast = weatherObj.list[i].weather[0].description;
						$("#tempC18").empty();
						$("#tempH18").empty();
						$("#tempL18").empty();
						$("#wind18").empty();
						$("#for18").empty();
						$("#tempC18").append(Math.round((tempCurrentK - 273.15) * 1.80 + 32));
						$("#tempH18").append(Math.round((tempMaxK - 273.15) * 1.80 + 32));
						$("#tempL18").append(Math.round((tempMinK - 273.15) * 1.80 + 32));
						$("#wind18").append(weatherObj.list[i].wind.speed);
						$("#for18").append(weatherObj.list[i].weather[0].description);
						
					}else if(i===26){
						var city = weatherObj.city.name;
						var tempCurrentK = weatherObj.list[i].main.temp;
						var tempCurrentF = Math.round((tempCurrentK - 273.15) * 1.80 + 32);
						var tempMaxK = weatherObj.list[i].main.temp_max;
						var tempMaxF = Math.round((tempMaxK - 273.15) * 1.80 + 32);
						var tempMinK = weatherObj.list[i].main.temp_min;
						var tempMinF = Math.round((tempMinK - 273.15) * 1.80 + 32);
						var wind = weatherObj.list[i].wind.speed;
						var forecast = weatherObj.list[i].weather[0].description;
						// empty table to enter another zip for weather
						$("#tempC26").empty();
						$("#tempH26").empty();
						$("#tempL26").empty();
						$("#wind26").empty();
						$("#for26").empty();
						$("#tempC26").append(Math.round((tempCurrentK - 273.15) * 1.80 + 32));
						$("#tempH26").append(Math.round((tempMaxK - 273.15) * 1.80 + 32));
						$("#tempL26").append(Math.round((tempMinK - 273.15) * 1.80 + 32));
						$("#wind26").append(weatherObj.list[i].wind.speed);
						$("#for26").append(weatherObj.list[i].weather[0].description);
						
					}
					
					
					
					
				}
				$("#cityWeather").empty();
				$("#cityWeather").append("5 Day Forecast for " +city);
				
						
				

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
				var fahrenheit = (9/5) * (weatherObj.list[i].main.temp - 273) + 32

				if (fahrenheit < 65) {
					// $('.coldlist').show();

				}
				if (fahrenheit > 85) {
					// $('.hotlist').show();
					
				}
				if (windspeed > _ ) {
					//display windy suggested items
				}
				if(rainy = true) {
					//display rainy suggested items
				}
							
			});		

		});

	

var generalList = ['tent', 'hammock', 'sleepingbag'];
var coldList = ['gloves', 'long underwear', 'wool socks'];
var windyList = ['extra stakes', 'rope', 'chapstick'];
var hotList = ['floppy hats', 'sunscreen', 'sandals']


function productDisplay() { 

	for (let i = 0; i < generalList.length; i++ ) {

		var walmartURL = 'https://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + generalList[i] + '&responseGroup=full';

			$.ajax({
				url: walmartURL,
				type: "GET",
				dataType: 'jsonp',
				cache: false, 
				success : function (response) {

					console.log('response', response)
					var items = response.items

					$(`#tab${i}`).text(response.query)
					$(`.menuTitle${i}`).text(response.query)
					$(`.brandMenuTitle${i}`).text(response.query)
					$(`.image${i}`).attr("src", items[0].largeImage);

					$(`.brandOne${i}`).text(items[0].brandName)
					$(`.brandTwo${i}`).text(items[1].brandName)
					$(`.brandThree${i}`).text(items[2].brandName)

					$(`#listOne${i}`).append(`<ul>
											  <li><a href="#">${items[0].name}</li>
											  <li><a href="#">Price: $${items[0].salePrice}</a></li>
											  <li><a href="#">This item has a customer review of: ${items[0].customerRating} stars</a></li>
											  </ul>`)

					$(`#listTwo${i}`).append(`<ul>
											  <li><a href="#">${items[1].name}</li>
						  					  <li><a href="#">Price: $${items[1].salePrice}</a></li>
											  <li><a href="#">This item has a customer review of: ${items[1].customerRating} stars</a></li>
											  </ul>`)

					$(`#listThree${i}`).append(`<ul>
												<li><a href="#">${items[2].name}</li>
												<li><a href="#">Price: $${items[2].salePrice}</a></li>
												<li><a href="#">This item has a customer review of: ${items[2].customerRating} stars</a></li>
												</ul>`)
				}
			})
	}
}


productDisplay();

};
})





// var clicked = false;
// $("body").on("click", '.mything', function(event){ 
// 	if (this.child = ) { 
		
// 	}
// 	else if (clicked === false) {
	
// 	}
// 	console.log('stuff');
// 	console.log('this', this)
// });

