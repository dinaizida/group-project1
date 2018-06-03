//hide non input fields on window load
window.onload = function(){
	$(".subtitle").hide();
	$('#cityInputDiv').hide();
	$('#cityInputDiv').fadeIn(2000);
	$(".subtitle").fadeIn(2000);
	$(".subtitle").text("Where Are We Camping?");
	
	
	
	$("#secondary-area").hide();
	

	$('.moreInfo').hide();
	$('.coldlist').hide();
	$('.hotlist').hide();

	$('.jumbotron').hide();
	
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
//function to empty weather table when another state selected in the input form
function cleanWeatherTable() {
	$("#weatherInfo").fadeOut(1000);
	$(".cT").empty();
	$(".cH").empty();
	$(".cL").empty();
	$(".wS").empty();
	$(".wF").empty();
	
	$("#weatherInfo").fadeIn(1000);
}
//on submit button click test to see if user input fits all criteria
$("#cityInputForm").on("click", "#checkWeather-btn", function(event){
	event.preventDefault();
	$('#campsiteList').empty();

	console.log("testing");
	//assign exprexxions to test input type
	var nameReg = /^[A-Za-z ]+$/;
	var numberReg =  /^[0-9]+$/;

	
	var validState = false;


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


	if (state.length > 0) {

		//if input valid show and begin all other data
		if(validState){
			$("#secondary-area").removeClass("hide");
			$("#secondary-area").fadeIn(5000);
			$(".error").empty();
			var today = moment().format("ddd, Do");
			$(".day-1").text(today);
			$(".day-2").text(moment().add(1 ,"days").format("ddd, Do"));
			$(".day-3").text(moment().add(2 ,"days").format("ddd, Do"));
			$(".day-4").text(moment().add(3 ,"days").format("ddd, Do"));
			$(".day-5").text(moment().add(4 ,"days").format("ddd, Do"));
		   
			// to empty weather table 
			cleanWeatherTable();
			
			$('.jumbotron').fadeIn(2000);
			$("#hideHeader").hide();
			$('.video').hide();
			$('.contentVideo').hide();
			$('#screen').hide();

			

			//call the campsite API
			$.ajax({
				url: campsiteQueryUrl,
				method: "GET"
			}).then(function(response){

				// Changes XML to JSON
				var myObj = xmlToJson(response);
				console.log(myObj);

				for(var i=0; i < myObj.resultset.result.length; i++){
					
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
						var houseTr = (`<tr><td><span><i data-Zipcode=${zipCode} class='iconTitle small material-icons nameButton'>wb_sunny</i></span>` + campSiteName + "</a></td><td><a href='https://maps.google.com/?q=" + mapQuery + "'target='_blank'>" + tdAddress + "</a></td></tr>")
						$('#campsiteList').append(houseTr);
					})
				}								
			})
		}
	};
	$('#coldRelatedProduct-area').addClass("hide")
	$('.coldlist').hide();
	$('#hotRelatedProduct-area').addClass("hide")
	$('.hotlist').hide();
	$('#rainRelatedProduct-area').addClass("hide")
	$('.rainlist').hide();
	$('#windRelatedProduct-area').addClass("hide")
	$('.windlist').hide();
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

			$.ajax({
				url: weatherQueryUrl,
				method: "GET"
			}).then(function(response){
				var weatherObj = response;
				console.log(weatherObj);
				// This forloop is checking today's and the next 5 day's weather

				var alreadyLooped = false;

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
					var windSpeed = weatherObj.list[i].wind.speed;
					// pulling forecast
					console.log(weatherObj.list[i].weather[0].description);
					var rainCheck = weatherObj.list[i].weather[0].main
					//pulling city name
					console.log(weatherObj.city.name);}


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
                        $("#tempC0").append(Math.round((tempCurrentK - 273.15) * 1.80 + 32)+ "°");
                        $("#tempH0").append(Math.round((tempMaxK - 273.15) * 1.80 + 32)+ "°");
                        $("#tempL0").append(Math.round((tempMinK - 273.15) * 1.80 + 32)+ "°");
                        $("#wind0").append(weatherObj.list[i].wind.speed + "mph");
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
                        $("#tempC2").append(Math.round((tempCurrentK - 273.15) * 1.80 + 32)+ "°");
                        $("#tempH2").append(Math.round((tempMaxK - 273.15) * 1.80 + 32)+ "°");
                        $("#tempL2").append(Math.round((tempMinK - 273.15) * 1.80 + 32)+ "°");
                        $("#wind2").append(weatherObj.list[i].wind.speed + "mph");
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
                        $("#tempC10").append(Math.round((tempCurrentK - 273.15) * 1.80 + 32)+ "°");
                        $("#tempH10").append(Math.round((tempMaxK - 273.15) * 1.80 + 32)+ "°");
                        $("#tempL10").append(Math.round((tempMinK - 273.15) * 1.80 + 32)+ "°");
                        $("#wind10").append(weatherObj.list[i].wind.speed+ "mph");
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
                        $("#tempC18").append(Math.round((tempCurrentK - 273.15) * 1.80 + 32)+ "°");
                        $("#tempH18").append(Math.round((tempMaxK - 273.15) * 1.80 + 32)+ "°");
                        $("#tempL18").append(Math.round((tempMinK - 273.15) * 1.80 + 32)+ "°");
                        $("#wind18").append(weatherObj.list[i].wind.speed + "mph");
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
                        $("#tempC26").append(Math.round((tempCurrentK - 273.15) * 1.80 + 32)+ "°");
                        $("#tempH26").append(Math.round((tempMaxK - 273.15) * 1.80 + 32)+ "°");
                        $("#tempL26").append(Math.round((tempMinK - 273.15) * 1.80 + 32)+ "°");
                        $("#wind26").append(weatherObj.list[i].wind.speed+ "mph");
                        $("#for26").append(weatherObj.list[i].weather[0].description);

					}


                }
                $("#cityWeather").empty();
				$("#cityWeather").append("5 Day Forecast for " +city);
				
				console.log('weather i', i)

				/// COLD //////////////////////////////////////////////////////////////
				if (fahrenheit < 65 ) {
					$('#coldRelatedProduct-area').removeClass("hide")
					$('.coldlist').show();

					if ($('#coldRelatedProduct-area').hasClass("visible")) {
						return
					}
					else {
						for (let i = 0; i < coldList.length; i++ ) {

							var coldwalmartURL = 'https://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + coldList[i] + '&responseGroup=full';
					
								$.ajax({
									url: coldwalmartURL,
									type: "GET",
									dataType: 'jsonp',
									cache: false,
									success : function (response) {

										console.log('response', response)
										var items = response.items
					
										$(`#coldtab${i}`).text(response.query);
										$(`.coldmenuTitle${i}`).append((response.query).toUpperCase());
										$(`.coldbrandMenuTitle${i}`).append((response.query).toUpperCase());
										$(`.coldimage${i}`).attr("src", items[1].largeImage);

										var rate0 = items[0].customerRating;
										if (rate0 == null) {
											rate0 = 'no';
										}
										var rate1 = items[1].customerRating;
										if (rate1 == null) {
											rate1 = 'no';
										}
										var rate2 = items[2].customerRating;
										if (rate2 == null) {
											rate2 = 'no';
										}
					
										$(`.coldbrandOne${i}`).append(items[0].brandName)
										$(`.coldbrandTwo${i}`).append(items[1].brandName)
										$(`.coldbrandThree${i}`).append(items[2].brandName)
					
										$(`#coldlistOne${i}`).append(`<ul>
																	<li><a target="_blank" href="${items[0].productUrl} ">${items[0].name}</li>
																	<li><a target="_blank" href="${items[0].productUrl} ">Price: $${items[0].salePrice}</a></li>
																	<li><a target="_blank" href="${items[0].productUrl} ">This item has a customer review of: ${items[0].customerRating} stars</a></li>
																	<li><img src="${items[0].imageEntities[0].thumbnailImage}"></li>
																	</ul>`)
					
										$(`#coldlistTwo${i}`).append(`<ul>
																	<li><a target="_blank" href="${items[1].productUrl} ">${items[1].name}</li>
																	<li><a target="_blank" href="${items[1].productUrl} ">Price: $${items[1].salePrice}</a></li>
																	<li><a target="_blank" href="${items[1].productUrl} ">This item has a customer review of: ${items[1].customerRating} stars</a></li>
																	<li><img src="${items[1].imageEntities[0].thumbnailImage}"></li>
																	</ul>`)
					
										$(`#coldlistThree${i}`).append(`<ul>
																	<li><a target="_blank" href="${items[2].productUrl} ">${items[2].name}</li>
																	<li><a target="_blank" href="${items[2].productUrl} ">Price: $${items[2].salePrice}</a></li>
																	<li><a target="_blank" href="${items[2].productUrl} ">This item has a customer review of: ${items[2].customerRating} stars</a></li>
																	<li><img src="${items[2].imageEntities[0].thumbnailImage}"></li>
																	</ul>`)
									}
								})
						}
					}
					$('#coldRelatedProduct-area').addClass("visible")
				}
				else {
					$('#coldRelatedProduct-area').addClass("hide")
					$('.coldlist').hide();
				}
				/// WARM /////////////////////////////////////////////////////
				if (fahrenheit > 75) {

						$('#hotRelatedProduct-area').removeClass("hide")
						$('.hotlist').show();
	
						if ($('#hotRelatedProduct-area').hasClass("visible")) {
							return
						}
						else {
							for (let i = 0; i < hotList.length; i++ ) {
		
								var hotwalmartURL = 'https://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + hotList[i] + '&responseGroup=full';
						
									$.ajax({
										url: hotwalmartURL,
										type: "GET",
										dataType: 'jsonp',
										cache: false, 
										success : function (response) {
						
											console.log('response', response)
											var items = response.items
						                    
											$(`#hottab${i}`).text(response.query)
											$(`.hotmenuTitle${i}`).append((response.query).toUpperCase());
											$(`.hotbrandMenuTitle${i}`).append((response.query).toUpperCase());
											$(`.hotimage${i}`).attr("src", items[0].largeImage);

											var rate0 = items[0].customerRating;
											if (rate0 == null) {
												rate0 = 'no';
											}
											var rate1 = items[1].customerRating;
											if (rate1 == null) {
												rate1 = 'no';
											}
											var rate2 = items[2].customerRating;
											if (rate2 == null) {
												rate2 = 'no';
										}
						
											$(`.hotbrandOne${i}`).append(items[0].brandName)
											$(`.hotbrandTwo${i}`).append(items[1].brandName)
											$(`.hotbrandThree${i}`).append(items[2].brandName)
											
						
											$(`#hotlistOne${i}`).append(`<ul>
																	<li><a target="_blank" href="${items[0].productUrl}">${items[0].name}</li>
																	<li><a target="_blank" href="${items[0].productUrl}">Price: $${items[0].salePrice}</a></li>
																	<li><a target="_blank" href="${items[0].productUrl}">This item has a customer review of: ${items[0].customerRating} stars</a></li>
																	<li><img src="${items[0].imageEntities[0].thumbnailImage}"></li>
																	</ul>`)
						
											$(`#hotlistTwo${i}`).append(`<ul>
																	<li><a target="_blank" href="${items[1].productUrl}">${items[1].name}</li>
																	<li><a target="_blank" href="${items[1].productUrl}">Price: $${items[1].salePrice}</a></li>
																	<li><a target="_blank" href="${items[1].productUrl}">This item has a customer review of: ${items[1].customerRating} stars</a></li>
																	<li><img src="${items[1].imageEntities[0].thumbnailImage}"></li>
																	</ul>`)
						
											$(`#hotlistThree${i}`).append(`<ul>
																		<li><a target="_blank" href="${items[2].productUrl}">${items[2].name}</li>
																		<li><a target="_blank" href="${items[2].productUrl}">Price: $${items[2].salePrice}</a></li>
																		<li><a target="_blank" href="${items[2].productUrl}">This item has a customer review of: ${items[2].customerRating} stars</a></li>
																		<li><img src="${items[2].imageEntities[0].thumbnailImage}"></li>
																		</ul>`)
										}
									})
							}
						}
						$('#hotRelatedProduct-area').addClass("visible")
					}
					else {
						$('#hotRelatedProduct-area').addClass("hide")
						$('.hotlist').hide();
					}
					/// WINDY /////////////////////////////////////////////////////
					if (windSpeed > 15 ) {
						
						$('#windRelatedProduct-area').removeClass("hide")
						$('.windlist').show();
	
						if ($('#windRelatedProduct-area').hasClass("visible")) {
							return
						}
						else {
							for (let i = 0; i < windList.length; i++ ) {
		
								var windwalmartURL = 'https://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + windyList[i] + '&responseGroup=full';
						
									$.ajax({
										url: windwalmartURL,
										type: "GET",
										dataType: 'jsonp',
										cache: false, 
										success : function (response) {
						
											console.log('response', response)
											var items = response.items
						
											$(`#windtab${i}`).text(response.query)
											$(`.windmenuTitle${i}`).append((response.query).toUpperCase());
											$(`.windbrandMenuTitle${i}`).append((response.query).toUpperCase());
											$(`.windimage${i}`).attr("src", items[0].largeImage);

											var rate0 = items[0].customerRating;
											if (rate0 == null) {
												rate0 = 'no';
											}
											var rate1 = items[1].customerRating;
											if (rate1 == null) {
												rate1 = 'no';
											}
											var rate2 = items[2].customerRating;
											if (rate2 == null) {
												rate2 = 'no';
											}
						
											$(`.windbrandOne${i}`).append(items[0].brandName)
											$(`.windbrandTwo${i}`).append(items[1].brandName)
											$(`.windbrandThree${i}`).append(items[2].brandName)
						
											$(`#windlistOne${i}`).append(`<ul>
																	<li><a target="_blank" href="${items[0].productUrl}">${items[0].name}</li>
																	<li><a target="_blank" href="${items[0].productUrl}">Price: $${items[0].salePrice}</a></li>
																	<li><a target="_blank" href="${items[0].productUrl}">This item has a customer review of: ${items[0].customerRating} stars</a></li>
																	<li><img src="${items[0].imageEntities[0].thumbnailImage}"></li>
																	</ul>`)
						
											$(`#windlistTwo${i}`).append(`<ul>
																	<li><a target="_blank" href="${items[1].productUrl}">${items[1].name}</li>
																	<li><a target="_blank" href="${items[1].productUrl}">Price: $${items[1].salePrice}</a></li>
																	<li><a target="_blank" href="${items[1].productUrl}">This item has a customer review of: ${items[1].customerRating} stars</a></li>
																	<li><img src="${items[1].imageEntities[0].thumbnailImage}"></li>
																	</ul>`)
						
											$(`#windlistThree${i}`).append(`<ul>
																		<li><a target="_blank" href="${items[2].productUrl}">${items[2].name}</li>
																		<li><a target="_blank" href="${items[2].productUrl}">Price: $${items[2].salePrice}</a></li>
																		<li><a target="_blank" href="${items[2].productUrl}">This item has a customer review of: ${items[2].customerRating} stars</a></li>
																		<li><img src="${items[2].imageEntities[0].thumbnailImage}"></li>
																		</ul>`)
										}
									})
							}
						}
						$('#windRelatedProduct-area').addClass("visible")
					}
					else {
						$('#windRelatedProduct-area').addClass("hide")
						$('.windlist').hide();
					}
					/// RAINY /////////////////////////////////////////////////////
					// if(rainCheck = "Rain") {
						
					// 	$('#rainRelatedProduct-area').removeClass("hide")
					// 	$('.rainlist').show();

					// 	if ($('#rainRelatedProduct-area').hasClass("visible")) {
					// 		return
					// 	}
					// 	else {
					// 		for (let i = 0; i < rainyList.length; i++ ) {
	
					// 			var rainwalmartURL = 'https://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + rainyList[i] + '&responseGroup=full';
						
					// 				$.ajax({
					// 					url: rainwalmartURL,
					// 					type: "GET",
					// 					dataType: 'jsonp',
					// 					cache: false, 
					// 					success : function (response) {
						
					// 						console.log('response', response)
					// 						var items = response.items
						
					// 						$(`#raintab${i}`).text(response.query)
					// 						$(`.rainmenuTitle${i}`).append((response.query).toUpperCase());
					// 						$(`.rainbrandMenuTitle${i}`).append((response.query).toUpperCase());
					// 						$(`.rainimage${i}`).attr("src", items[0].largeImage);
						
					// 						$(`.rainbrandOne${i}`).append(items[0].brandName)
					// 						$(`.rainbrandTwo${i}`).append(items[1].brandName)
					// 						$(`.rainbrandThree${i}`).append(items[2].brandName)
						
					// 						$(`#rainlistOne${i}`).append(`<ul>
					// 												  <li><a target="_blank" href="${items[0].productUrl}">${items[0].name}</li>
					// 												  <li><a target="_blank" href="${items[0].productUrl}">Price: $${items[0].salePrice}</a></li>
					// 												  <li><a target="_blank" href="${items[0].productUrl}">This item has a customer review of: ${items[0].customerRating} stars</a></li>
					// 												  <li><img src="${items[0].imageEntities[0].thumbnailImage}"></li>
					// 												  </ul>`)
						
					// 						$(`#rainlistTwo${i}`).append(`<ul>
					// 												  <li><a target="_blank" href="${items[1].productUrl}">${items[1].name}</li>
					// 												  <li><a target="_blank" href="${items[1].productUrl}">Price: $${items[1].salePrice}</a></li>
					// 												  <li><a target="_blank" href="${items[1].productUrl}">This item has a customer review of: ${items[1].customerRating} stars</a></li>
					// 												  <li><img src="${items[1].imageEntities[0].thumbnailImage}"></li>
					// 												  </ul>`)
						
					// 						$(`#rainlistThree${i}`).append(`<ul>
					// 													<li><a target="_blank" href="${items[2].productUrl}">${items[2].name}</li>
					// 													<li><a target="_blank" href="${items[2].productUrl}">Price: $${items[2].salePrice}</a></li>
					// 													<li><a target="_blank" href="${items[2].productUrl}">This item has a customer review of: ${items[2].customerRating} stars</a></li>
					// 													<li><img src="${items[2].imageEntities[0].thumbnailImage}"></li>
					// 													</ul>`)
					// 					}
					// 				})
					// 		}
					// 	}
					// 	$('#rainRelatedProduct-area').addClass("visible")
					// }
					// else {
					// 	$('#rainRelatedProduct-area').addClass("hide")
					// 	$('.rainlist').hide();
					// }

				//To convert from Kelvin to Fahrenheit: F = (K - 273.15) * 1.80 + 32
				var tempK = weatherObj.list[0].main.temp;
				console.log('temperature', tempK)
				

			});

		});



var generalList = ['tent', 'hammock', 'sleepingbag'];
var coldList = ['winter gloves', 'long underwear', 'wool socks'];
var windyList = ['extra stakes', 'windbreaker ', 'chapstick'];
var hotList = ['floppy hats', 'sunscreen', 'sandals'];
var rainyList = ['rainboots', 'umbrella', 'tarp'];


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
					$(`.menuTitle${i}`).append((response.query).toUpperCase());
					$(`.brandMenuTitle${i}`).append((response.query).toUpperCase());
					$(`.image${i}`).attr("src", items[0].largeImage);

					var rate0 = items[0].customerRating;
					if (rate0 == null) {
						rate0 = 'no';
					}
					var rate1 = items[1].customerRating;
					if (rate1 == null) {
						rate1 = 'no';
					}
					var rate2 = items[2].customerRating;
					if (rate2 == null) {
						rate2 = 'no';
					}

					$(`.brandOne${i}`).append(items[0].brandName)
					$(`.brandTwo${i}`).append(items[1].brandName)
					$(`.brandThree${i}`).append(items[2].brandName)

					$(`#listOne${i}`).append(`<ul>
											  <li><a target="_blank" href="${items[0].productUrl}">${items[0].name}</li>
											  <li><a target="_blank" href="${items[0].productUrl}">Price: $${items[0].salePrice}</a></li>
											  <li><a target="_blank" href="${items[0].productUrl}">This item has a customer review of: ${items[0].customerRating} stars</a></li>
											  <li><img src="${items[0].imageEntities[0].thumbnailImage}"></li>
											  </ul>`)

					$(`#listTwo${i}`).append(`<ul>
											  <li><a target="_blank" href="${items[1].productUrl}">${items[1].name}</li>
						  					  <li><a target="_blank" href="${items[1].productUrl}">Price: $${items[1].salePrice}</a></li>
											  <li><a target="_blank" href="${items[1].productUrl}">This item has a customer review of: ${items[1].customerRating} stars</a></li>
											  <li><img src="${items[1].imageEntities[0].thumbnailImage}"></li>
											  </ul>`)

					$(`#listThree${i}`).append(`<ul>
												<li><a target="_blank" href="${items[2].productUrl}">${items[2].name}</li>
												<li><a target="_blank" href="${items[2].productUrl}">Price: $${items[2].salePrice}</a></li>
												<li><a target="_blank" href="${items[2].productUrl}">This item has a customer review of: ${items[2].customerRating} stars</a></li>
												<li><img src="${items[2].imageEntities[0].thumbnailImage}"></li>
												</ul>`)


				}
			})
	}
}


productDisplay();
