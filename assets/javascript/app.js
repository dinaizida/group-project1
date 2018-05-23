//hide non input fields on window load
window.onload = function() {
    $('.moreInfo').hide();
    $('.coldlist').hide();
    $('.hotlist').hide();
}
//GLOBAL VAR
var newCampsiteName = []; // array to store campsite names
var newCampsiteAddress = []; //  store campsite address
var googleMapAddress = [];   // store campsite url to link to google map page

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
        for (var i = 0; i < xml.childNodes.length; i++) {
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

//on submit button click test to see if user input fits all criteria
$("#cityInputForm").on("click", "#checkWeather-btn", function(event) {
    event.preventDefault();

    console.log("testing");

    //assign exprexxions to test input type
    var nameReg = /^[A-Za-z]+$/;
    var numberReg = /^[0-9]+$/;

    //setting validity of each input to false
    var validCity = false;
    var validZip = false;
    var validState = false;

    //check if city field is blank or contains a non letter character
    //else city is valid = true
    var city = $("#city-input").val().trim();
    if (city == "") {
        $('#formErrorCity').text(' ' + 'Please enter ' + ' ');
    } else if (!nameReg.test(city)) {
        $('#formErrorCity').text(' ' + ' Letters only for ' + ' ');
    } else {
        $(".city-error").remove();
        validCity = true;
    }

    //check if zip field blank,contains a non number or is shorter than 5 numbers
    //else zip is valid = true
    var zip = $("#zip-input").val().trim();
    if (zip == "") {
        $('#formErrorZip').text(' ' + 'Please enter ' + ' ');
    } else if (!numberReg.test(zip)) {
        $('#formErrorZip').text(' ' + ' Numbers only for ' + ' ');
    } else if (zip.length !== 5) {
        $('#formErrorZip').text(' ' + ' Please enter valid' + ' ');
    } else {
        $(".zip-error").remove();
        validZip = true;
    }

    //check if state is blank
    //else state is valid = true
    var state = $("#selectState").val().trim();
    if (state == "") {
        $('#formErrorState').text(' ' + 'Please ' + ' ');
    } else {
        $(".state-error").remove();
        validState = true;
    }
    $("#page").empty();
    // Beginning Ajax call for Active Access
    var campsiteApiKey = "dnhsxuups2jvp66yevxeramm";
    var campsiteQueryUrl = "http://cors-everywhere.herokuapp.com/http://api.amp.active.com/camping/campgrounds?pstate=" + state + "&siteType=2003&api_key=" + campsiteApiKey;

    //if input valid show and begin all other data
    if (validCity && validState && validZip) {
        $("#secondary-area").removeClass("hide");
        $(".error").empty();


        //render campsite infor into the papge

        var latitude = [];
        var longitude = [];
        //call the campsite API
        $.ajax({
                url: campsiteQueryUrl,
                method: "GET"
            }).then(function(response) {
                // Changes XML to JSON
                var myObj = xmlToJson(response);
                console.log("campsite object = " + myObj);
                //Pulling campsite name
                console.log(JSON.stringify(myObj.resultset.result[3]["@attributes"].facilityName));
                // Pulling campsite latitude
                console.log(JSON.stringify(myObj.resultset.result[3]["@attributes"].latitude));
                // Pulling campsite Longitude
                console.log(JSON.stringify(myObj.resultset.result[3]["@attributes"].longitude));

                for (var i = 0; i < 50; i++) {
                      
                    //grab coordinates for google address API
                    latitude[i] = myObj.resultset.result[i]["@attributes"].latitude;
                    longitude[i] = myObj.resultset.result[i]["@attributes"].longitude;
                    newCampsiteName.push(myObj.resultset.result[i]["@attributes"].facilityName);

                    console.log("new camp name number " + i + "name==" + newCampsiteName[i]);

                    // window.latitude = latitude;
					// window.longitude = longitude;
					
					console.log(' camp name latitude ==' + latitude[i]);
					console.log(' camp name longitude ==' + longitude[i]);

                    var googleURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude[i] + ',' + longitude[i] + '&location_type=ROOFTOP&result_type=street_address&key=AIzaSyC3waa22L4Uh9nWzsVhpw9CId5Ud3k4atU';

                    $.ajax({
                        url: googleURL,
                        method: "GET"
                    }).then(function(response) {
                        // console.log(" campsite ADDRESS === " + response);

						// console.log("new camp name number- " + i + newCampsiteName[i]);
						// console.log('new camp ADDRESS for number - ' + i +  newCampsiteAddres[i]);
						
						console.log(response);
						console.log(response.results[0].formatted_address);
						
				        mapQuery = (response.results[0].formatted_address).replace(/ /g , "+");
				        var tdAddress = $('<td><a href="https://maps.google.com/?q=' + mapQuery + '">' + response.results[0].formatted_address + '</a></td>')
						houseTR.append(tdAddress);	


						newCampsiteAddress.push(response.results[0].formatted_address);

                    })

                }

                // 

                // campsite names and addresses

                // var newCampsiteAddress = ["1503 West 9th St, Austin, TX, 78703", "525 N Lamar Blvd, Austin, TX 78703", "addressThree1", "addressFour1", "addressFive1",
                //     "addressOne2", "addressTwo2", "addressThree2", "addressFour2", "addressFive2",
                //     "addressOne3", "addressTwo3", "addressThree3", "addressFour3", "addressFive3",
                //     "addressOne4", "addressTwo4", "addressThree4", "addressFour4", "addressFive4",
                //     "addressOne5", "addressTwo5", "addressThree5", "addressFour5", "addressFive5"
                // ];

                // show pagination buttons
                $("#page").empty();
                var numberOfItems = newCampsiteName.length // Get total number of the items that should be paginated
                var limitPerPage = 5; // Limit of items per each page
                $('#page .list-group:gt(' + (limitPerPage - 1) + ')').hide(); // Hide all items over page limits (e.g., 5th item, 6th item, etc.)
                var totalPages = Math.round(numberOfItems / limitPerPage); // Get number of pages
                $(".pagination").append("<li class=' current-page active'><a href='javascript:void(0)'>" + 1 + "</a></li>"); // Add first page marker

                // Loop to insert page numbers  (for each sets of items equal to page limit- limit of 5 with 20 total items = insert 4 pages)
                for (var i = 2; i <= totalPages; i++) {
                    $(".pagination").append("<li class=' current-page waves-effect '><a href='javascript:void(0)'>" + i + "</a></li>"); // Insert page number into pagination tabs
                }

                // Add next button after all the page numbers  
                $(".pagination").append("<li class='waves-effect ' id='next-page'><i class='material-icons'>chevron_right</i></li>");

                for (i = 0; i < limitPerPage; i++) {
	
					// array for google map for each campsite
					googleMapAddress[i] = "https://www.google.com/maps/place/" + newCampsiteAddress[i] ;
					
					var tr = $("<tr >");
                    tr.append("<td>" + newCampsiteName[i] +
                        "</td><td>" +  newCampsiteAddress[i] + '<a href="  '+ googleMapAddress[i] + '  " target="_blank"><span><i class=" iconTitle small material-icons">directions</i></span></a>' +
                        "</td>"
                    )
					$("#page").append(tr);
					

				}
				
                  // select compsite table pages based on  pagination page number
                $(document).on("click", ".current-page", function(event) {
					event.preventDefault();
					

					if ($(this).hasClass('active')) {
						return false; // Return false (i.e., nothing to do, since user clicked on the page number that is already being displayed)
					  } else {
						        $(".pagination li").removeClass('active'); // Remove the 'active' class status from the page that is currently being displayed
						        $(this).addClass('active'); // Add the 'active' class status to the page that was clicked on
						
								var nBegin = ($(this).text() - 1) * limitPerPage;
								
								var nEnd = $(this).text() * limitPerPage - 1;

								$("#page").empty();
							
								
								for (var i = nBegin; i <= nEnd; i++) {
									
									var tr = $("<tr >");
									tr.append("<td>" + newCampsiteName[i] +
										"</td><td>" + newCampsiteAddress[i] + '<a href="  '+ googleMapAddress[i] + '  " target="_blank"><span><i class=" iconTitle small material-icons">directions</i></span></a>' +
										"</td>"
									)
									$("#page").append(tr);
								}
					        }	
                });

            })
            // Beginning Ajax call for weather API
        var weatherApiKey = "ba9485900797575aadc3a1081bfa14f7";
        var weatherQueryUrl = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&zip=" + zip + "&APPID=" + weatherApiKey;

        // Moment.js functions to assign correct days to the weather display
        //format as day of week and day of month with ordinal. Add days and format
        var today = moment().format("ddd, Do");
        $(".day-1").text(today);
        $(".day-2").text(moment().add(1, "days").format("ddd, Do"));
        $(".day-3").text(moment().add(2, "days").format("ddd, Do"));
        $(".day-4").text(moment().add(3, "days").format("ddd, Do"));
        $(".day-5").text(moment().add(4, "days").format("ddd, Do"));

        $.ajax({
            url: weatherQueryUrl,
            method: "GET"
        }).then(function(response) {
            var weatherObj = response;
            console.log(weatherObj);
            // This forloop is checking today's and the next 5 day's weather
            for (var i = 0; i < weatherObj.list.length; i++) {
                if (i === 0 || i === 2 || i === 10 || i === 18 || i === 26 || i === 34) {
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
                    console.log(weatherObj.city.name);
                }
            }

            var fahrenheit = (9 / 5) * (weatherObj.list[i].main.temp - 273) + 32

            if (fahrenheit < 65) {
                $('.coldlist').show();
                var coldItemDiv = $('<div class="simpleDisplay">');
                for (var i = 0; i < generalList.length; i++) {

                    var walmartURL = 'http://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + coldList[i] + '&responseGroup=full';

                    $.ajax({
                        url: walmartURL,
                        method: "GET",
                        dataType: 'jsonp',
                        cache: false,
                        success: function(response) {

                            console.log('response', response)
                            console.log('saleprice', response.items[0].salePrice)
                            var coldItems = response.items

                            coldItemDiv.append('<div class="productTitle">' + response.query + '</div>')

                            for (var j = 0; j < coldItems.length; j++) {

                                if (j > 2) {
                                    return
                                }
                                coldItemDiv.append('<div class="moreInfo">' + coldItems[j].name + '<br>' + coldItems[j].salePrice + '</div>')
                                coldItemDiv.attr('data-clickable', coldItems[j].name)
                                $('#coldResultslisting').append(coldItemDiv)
                                console.log('items[i]', coldItems[j])
                                console.log('items[i].salePrice', coldItems[j].salePrice)
                            }
                        }
                    })
                }
            }
            if (fahrenheit > 85) {
                $('.hotlist').show();
                for (var i = 0; i < hotList.length; i++) {

                    var hotWalmartURL = 'http://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + hotList[i] + '&responseGroup=full';

                    $.ajax({
                        url: hotWalmartURL,
                        type: "GET",
                        dataType: 'jsonp',
                        cache: false,
                        success: function(response) {

                            var groupingDiv = $('<div>');

                            // itemDiv.append(groupingDiv);
                            console.log('response', response.items[0].name)
                            console.log('saleprice', response.items[0].salePrice)
                            var items = response.items

                            groupingDiv.append('<div class="productTitle">' + response.query + '</div>')

                            for (var j = 0; j <= 2; j++) {
                                groupingDiv.append('<div class="moreInfo">' + items[j].name + '<br>' + items[j].salePrice + '</div>');
                                groupingDiv.addClass('groupingDiv');
                                $('#hotResultslisting').append(groupingDiv);
                            }
                        }
                    })
                }
            }
            if (windspeed > _) {
                //display windy suggested items
            }
            if (rainy = true) {
                //display rainy suggested items
            }
        })
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

var generalList = ['tent', 'stakes', 'hammock', 'sleeping bag', 'bug spray', 'ice chest', 'batteries', 'chairs', 'tarp clips', 'suran wrap', 'zip ties', 'air mattress', 'paper towels', 'trash bags', 'head lamps', 'foils', 'paper towels', 'floaties', 'fishing gear'];
var coldList = ['blankets', 'gloves', 'long underwear', 'wool socks'];
var windyList = ['extra stakes', 'rope', 'chapstick'];
var hotList = ['floppy hats', 'sunscreen', 'sandals', 'ez up']

var itemDiv = $('<div class="simpleDisplay">');

function productDisplay() {

    for (var i = 0; i < generalList.length; i++) {

        var walmartURL = 'http://api.walmartlabs.com/v1/search?apiKey=dq426fn6pm95592scdkq99j4&query=' + generalList[i] + '&responseGroup=full';

        $.ajax({
            url: walmartURL,
            type: "GET",
            dataType: 'jsonp',
            cache: false,
            success: function(response) {

                var groupingDiv = $('<div>');

                // itemDiv.append(groupingDiv);
                console.log('response', response.items[0].name)
                console.log('saleprice', response.items[0].salePrice)
                var items = response.items

                groupingDiv.append('<div class="productTitle">' + response.query + '</div>')

                for (var j = 0; j <= 2; j++) {

                    groupingDiv.append('<div class="moreInfo">' + items[j].name + '<br>' + items[j].salePrice + '</div>')
                    groupingDiv.addClass('groupingDiv')
                    $('#resultslisting').append(groupingDiv)
                }

            }
        })
    }
}

productDisplay();

var clicked = false;
$("body").on("click", '.productTitle', function(event) {
    if (clicked === true) {
        clicked = false;
        $(this).parent().find('.moreInfo').hide();
    } else if (clicked === false) {
        clicked = true;
        $(this).parent().find('.moreInfo').show();
    }
    console.log('stuff');
    console.log(this)
});