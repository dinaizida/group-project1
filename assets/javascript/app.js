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
	} else if (xml.nodeType == 3) { // append
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
	console.log("testing");
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
		$('#formErrorCity').append(' ' + 'Please enter ' +' ' );
	} 
	else if(!nameReg.test(city)){
		$('#formErrorCity').append(' ' + ' Letters only for '+ ' ' );
	}
	else{
		$(".city-error").remove();
		validCity = true;
	}

	//check if zip field blank,contains a non number or is shorter than 5 numbers
	//else zip is valid = true
	var zip = $("#zip-input").val().trim();
	if(zip == ""){
		$('#formErrorZip').append(' ' + 'Please enter ' +' ' );
	}
	else if(!numberReg.test(zip)){
		$('#formErrorZip').append(' ' + ' Numbers only for '+ ' ' );
	}
	else if(zip.length !== 5){
		$('#formErrorZip').append(' ' + ' Please enter valid' + ' ');
	}
	else{
		$(".zip-error").remove();
		validZip = true;
	}
	
	//check if state is blank
	//else state is valid = true
	var state = $("#selectState").val().trim();
	if(state == ""){
		$('#formErrorState').append(' ' + 'Please ' +' ');
	} 
	else{
		$(".state-error").remove();
		validState = true;
	}
	// Beginning Ajax call for Active Access
	var campsiteApiKey = "dnhsxuups2jvp66yevxeramm";
	var campsiteQueryUrl = "https://cors-everywhere.herokuapp.com/http://api.amp.active.com/camping/campgrounds?pstate=" + state + "&siteType=2003&api_key=" + campsiteApiKey;	

	if (state.length > 0 && city.length > 0 && zip.length === 5) {
		//if input valid show and begin all other data
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
				console.log(myObj);

				for(var i=0; i < 5; i++){
					//Pulling campsite name
					// console.log(JSON.stringify(myObj.resultset.result[i]["@attributes"].facilityName));
					// Pulling campsite latitude
					// console.log(JSON.stringify(myObj.resultset.result[i]["@attributes"].latitude));
					// Pulling campsite Longitude
					// console.log(JSON.stringify(myObj.resultset.result[i]["@attributes"].longitude));
					let latitude = myObj.resultset.result[i]["@attributes"].latitude;
					let longitude = myObj.resultset.result[i]["@attributes"].longitude;
					let campSiteName= myObj.resultset.result[i]["@attributes"].facilityName;
					console.log (campSiteName);
					window.latitude = latitude;
					window.longitude = longitude;								
					var googleURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&location_type=ROOFTOP&result_type=street_address&key=AIzaSyC3waa22L4Uh9nWzsVhpw9CId5Ud3k4atU';


					$.ajax({
						url: googleURL,
						method: "GET"
					}).then(function(response){
						console.log(response);
						console.log("TEST" + response.results[0].address_components[6].long_name);
						var zipCode = response.results[0].address_components[6].long_name;
						// console.log(response.results[0].formatted_address);
						var mapQuery = (response.results[0].formatted_address).replace(/ /g , "+");						
						var tdAddress = response.results[0].formatted_address;	
						var houseTr = (`<tr><td><a class='nameButton' data-Zipcode=${zipCode}>` + campSiteName + "<p class='hoverMagic'>click to view weather</p>" + "</a></td><td><a href='https://maps.google.com/?q=" + mapQuery + "'target='_blank'>" + tdAddress + "</a></td></tr>")
						$('#campsiteList').append(houseTr);
					})
				}								
			})
		}
	};
})



	$("#campsiteList").on("click", ".nameButton", function(){
		event.preventDefault();
		var currentZip = $(this).attr("data-zipCode");
		console.log(currentZip);

	// Beginning Ajax call for weather API
			var weatherApiKey = "ba9485900797575aadc3a1081bfa14f7";
			var weatherQueryUrl = "https://api.openweathermap.org/data/2.5/forecast?zip=" + currentZip + "&APPID=" + weatherApiKey; 
			// Moment.js functions to assign correct days to the weather display
			//format as day of week and day of month with ordinal. Add days and format
			var today = moment().format("ddd, Do");
			$(".day-1").append(today);
			$(".day-2").append(moment().add(1 ,"days").format("ddd, Do"));
			$(".day-3").append(moment().add(2 ,"days").format("ddd, Do"));
			$(".day-4").append(moment().add(3 ,"days").format("ddd, Do"));
			$(".day-5").append(moment().add(4 ,"days").format("ddd, Do"));			
			
			$.ajax({
				url: weatherQueryUrl,
				method: "GET"
			}).then(function(response){
				var weatherObj = response;
				console.log(weatherObj);
				// This forloop is checking today's and the next 5 day's weather
				for(var i=0; i<weatherObj.list.length; i++){
					if (i === 0 || i === 2 || i === 10 || i === 18 || i === 26 || i === 34){
						
					console.log('main temp',weatherObj.list[i].main.temp);
					var mainTemp = weatherObj.list[i].main.temp

					var fahrenheit = (9/5) * (mainTemp - 273.15) + 32;
					console.log('fahrenheit', fahrenheit)

					// pulling today's high temperature
					console.log('todays high temperature', weatherObj.list[i].main.temp_max);
					console.log('i', i)
					// pulling today's low temp
					console.log(weatherObj.list[i].main.temp_min);
					// Pulling wind speed
					console.log(weatherObj.list[i].wind.speed);
					// pulling forecast
					console.log(weatherObj.list[i].weather[0].description);
					//pulling city name
					console.log(weatherObj.city.name);}

					/// COLD //////////////////////////////////////////////////////////////
					if (fahrenheit < 65 ) {
						$('#coldRelatedProduct-area').removeClass("hide")
						$('.coldlist').show();
	
						for (let i = 0; i < coldList.length; i++ ) {
	
							var coldwalmartURL = 'http://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + coldList[i] + '&responseGroup=full';
					
								$.ajax({
									url: coldwalmartURL,
									type: "GET",
									dataType: 'jsonp',
									cache: false, 
									success : function (response) {
					
										console.log('response', response)
										var items = response.items
					
										$(`#coldtab${i}`).text(response.query)
										$(`.coldmenuTitle${i}`).append(response.query)
										$(`.coldbrandMenuTitle${i}`).append(response.query)
										$(`.coldimage${i}`).attr("src", items[0].largeImage);
					
										$(`.coldbrandOne${i}`).append(items[0].brandName)
										$(`.coldbrandTwo${i}`).append(items[1].brandName)
										$(`.coldbrandThree${i}`).append(items[2].brandName)
					
										$(`#coldlistOne${i}`).append(`<ul>
																  <li><a href="#">${items[0].name}</li>
																  <li><a href="#">Price: $${items[0].salePrice}</a></li>
																  <li><a href="#">This item has a customer review of: ${items[0].customerRating} stars</a></li>
																  </ul>`)
					
										$(`#coldlistTwo${i}`).append(`<ul>
																  <li><a href="#">${items[1].name}</li>
																	<li><a href="#">Price: $${items[1].salePrice}</a></li>
																  <li><a href="#">This item has a customer review of: ${items[1].customerRating} stars</a></li>
																  </ul>`)
					
										$(`#coldlistThree${i}`).append(`<ul>
																	<li><a href="#">${items[2].name}</li>
																	<li><a href="#">Price: $${items[2].salePrice}</a></li>
																	<li><a href="#">This item has a customer review of: ${items[2].customerRating} stars</a></li>
																	</ul>`)
									}
								})
						}
	
					}
					/// WARM /////////////////////////////////////////////////////
					if (fahrenheit > 75) {
						$('#hotRelatedProduct-area').removeClass("hide")
						$('.hotlist').show();
	
						for (let i = 0; i < hotList.length; i++ ) {
	
							var hotwalmartURL = 'http://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + hotList[i] + '&responseGroup=full';
					
								$.ajax({
									url: hotwalmartURL,
									type: "GET",
									dataType: 'jsonp',
									cache: false, 
									success : function (response) {
					
										console.log('response', response)
										var items = response.items
					
										$(`#hottab${i}`).text(response.query)
										$(`.hotmenuTitle${i}`).append(response.query)
										$(`.hotbrandMenuTitle${i}`).append(response.query)
										$(`.hotimage${i}`).attr("src", items[0].largeImage);
					
										$(`.hotbrandOne${i}`).append(items[0].brandName)
										$(`.hotbrandTwo${i}`).append(items[1].brandName)
										$(`.hotbrandThree${i}`).append(items[2].brandName)
					
										$(`#hotlistOne${i}`).append(`<ul>
																  <li><a href="#">${items[0].name}</li>
																  <li><a href="#">Price: $${items[0].salePrice}</a></li>
																  <li><a href="#">This item has a customer review of: ${items[0].customerRating} stars</a></li>
																  </ul>`)
					
										$(`#hotlistTwo${i}`).append(`<ul>
																  <li><a href="#">${items[1].name}</li>
																	<li><a href="#">Price: $${items[1].salePrice}</a></li>
																  <li><a href="#">This item has a customer review of: ${items[1].customerRating} stars</a></li>
																  </ul>`)
					
										$(`#hotlistThree${i}`).append(`<ul>
																	<li><a href="#">${items[2].name}</li>
																	<li><a href="#">Price: $${items[2].salePrice}</a></li>
																	<li><a href="#">This item has a customer review of: ${items[2].customerRating} stars</a></li>
																	</ul>`)
									}
								})
						}
						
					}
					/// WINDY /////////////////////////////////////////////////////
					if (fahrenheit > _ ) {
						//display windy suggested items
					}
					/// RAINY /////////////////////////////////////////////////////
					if(fahrenheit = true) {
						//display rainy suggested items
					}

				}

				//To convert from Kelvin to Fahrenheit: F = (K - 273.15) * 1.80 + 32
				var tempK = weatherObj.list[0].main.temp;
				console.log('temperature', tempK)
				// render weather info into Weather table
				var wCity = weatherObj.city.name;
				var wTemp = (9/5) * (tempK - 273.15) + 32;
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
				
				console.log('fahrenheit', wTemp)
							
			});		

		});

	

var generalList = ['tent', 'hammock', 'sleepingbag'];
var coldList = ['gloves', 'long underwear', 'wool socks'];
var windyList = ['extra stakes', 'rope', 'chapstick'];
var hotList = ['floppy hats', 'sunscreen', 'sandals'];
var rainyList = ['rainboots', 'umbrella', 'tarp'];


function productDisplay() { 

	for (let i = 0; i < generalList.length; i++ ) {

		var walmartURL = 'http://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + generalList[i] + '&responseGroup=full';

			$.ajax({
				url: walmartURL,
				type: "GET",
				dataType: 'jsonp',
				cache: false, 
				success : function (response) {

					console.log('response', response)
					var items = response.items

					$(`#tab${i}`).text(response.query)
					$(`.menuTitle${i}`).append(response.query)
					$(`.brandMenuTitle${i}`).append(response.query)
					$(`.image${i}`).attr("src", items[0].largeImage);

					$(`.brandOne${i}`).append(items[0].brandName)
					$(`.brandTwo${i}`).append(items[1].brandName)
					$(`.brandThree${i}`).append(items[2].brandName)

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
												<li><a href="#">${items[3].name}</li>
												<li><a href="#">Price: $${items[3].salePrice}</a></li>
												<li><a href="#">This item has a customer review of: ${items[3].customerRating} stars</a></li>
												</ul>`)

					
				}
			})
	}
}


productDisplay();






// var clicked = false;
// $("body").on("click", '.mything', function(event){ 
// 	if (this.child = ) { 
		
// 	}
// 	else if (clicked === false) {
	
// 	}
// 	console.log('stuff');
// 	console.log('this', this)
// });

