console.log("working");

var apiKey = "dnhsxuups2jvp66yevxeramm";
var queryUrl = "http://cors-everywhere.herokuapp.com/http://api.amp.active.com/camping/campgrounds?pstate=TX&api_key=dnhsxuups2jvp66yevxeramm";

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
$.ajax({
    url: queryUrl,
    method: "GET"
}).then(function(response){
    console.log(response);
// Changes XML to JSON
    var myObj = xmlToJson(response);
	console.log(myObj);
	for (var i=0; i<10; i++){
	$(".test").text(JSON.stringify(myObj.resultset.result[i]["@attributes"].facilityName));
	}
	console.log(JSON.stringify(myObj.resultset.result[3]["@attributes"].facilityName));
})


$(".test").text("test");

