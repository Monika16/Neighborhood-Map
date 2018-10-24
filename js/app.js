var map;
var largeInfoWindow;
var mainMarkers = [];
var defaultIcon = "";
var highlightedIcon = "";
/* List of locations to be shown on map */
var locations = [{
	title: 'Samburna Indian Restaurant',
	location: {
		lat: 47.809221125403,
		lng: -122.208753930654
	}
}, {
	title: 'Dine India',
	location: {
		lat: 47.811073,
		lng: -122.207404
	}
}, {
	title: 'Namasthe Indian Restaurant',
	location: {
		lat: 47.7903,
		lng: -122.2195
	}
}, {
	title: 'Hyderabad House',
	location: {
		lat: 47.7798,
		lng: -122.2197
	}
}, {
	title: 'Ruchi Indian Restaurant',
	location: {
		lat: 47.83525,
		lng: -122.20988
	}
}];
/* Show listings is on or off default off */
var listings = false;
/* Yelp Key to access info from Yelp*/
var yelp_key = "oTb6ms6uQPyfpXxz6sTGIq5hHX3bePLmKGottlLE" + "l7C8IIM6FO2WmgXIN7962QssDot2PQiS0wrSxCEpn3" + "xABj0_WQJZ5ZJw9XFn6JJ4-TGYnzBacdimzTX2fV61W3Yx";
/* To create infowindow when a marker is clicked */
function populateInfoWindow(marker, map, position, infowindow) {
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		var term = marker.title.substr(0, marker.title.indexOf(' '));
		var idurl = "https://cors-anywhere.herokuapp.com/https:" + "//api.yelp.com/v3/businesses/search?term=" + term + "&latitude=" + position.lat + "&longitude=" + position.lng;
		/* Ajax request to get information from Yelp */
		$.ajax({
			"async": true,
			"crossDomain": true,
			"url": idurl,
			"headers": {
				"Authorization": 'Bearer ' + yelp_key,
			},
			"dataType": "json",
			success: function(data) {
				var review = data.businesses[0];
				/* Address in InfoWindow */
				var address = review.location.address1 + " " + review.location.address2 + " " + review.location.address3 + " " + review.location.city + " " + review.location.state + " " + review.location.zip_code;
				infowindow.setContent('<div id=\"content\"><h3>' + review.name + '</h3><p><strong>Address: </strong>' + address + '</p><p><strong>Rating: </strong>' + review.rating + '</p><img id="rimg" src="' + review.image_url + '" alt="' + review.name + '"></div>');
				infowindow.open(map, marker);
				if(marker.getAnimation()!==null){
					marker.setAnimation(null);
				}
				infowindow.addListener('closeclick', function() {
					marker.setIcon(defaultIcon);
					infowindow.marker = null;
				});
			},
			error: function(data) {
				if(marker.getAnimation()!==null){
					marker.setAnimation(null);
				}
				console.log(data);
				alert("Error loading InfoWindow- " + data.status + " : " + data.statusText);
			}
		});
	};
};
/* Create markers*/
function makeMarker(loc){
	/* Store Markers */
	var markers = [];
	for (var i = 0; i < loc.length; i++) {
		var title = loc[i].title;
		var position = loc[i].location;
		var marker = new google.maps.Marker({
			title: title,
			position: position,
			icon: defaultIcon,
			animation: google.maps.Animation.DROP,
			id: i
		});
		markers.push(marker);
		marker.addListener('click', function() {
			if(this.getAnimation() !== null){
				this.setAnimation(null);
			}else{
				this.setAnimation(google.maps.Animation.BOUNCE);
			}
			this.setIcon(highlightedIcon);
			populateInfoWindow(this, map, position, largeInfoWindow);
		});
	}
	return markers;
};
/* Initialize map */
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 47.776857,
			lng: -122.204997
		},
		zoom: 13
	});
	largeInfoWindow = new google.maps.InfoWindow();
	/* Marker Image */
	function makeImage(markerColor){
		var image = new google.maps.MarkerImage(
				     'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ 
				      markerColor +
	        	      '|40|_|%E2%80%A2',
	        	    new google.maps.Size(21, 34),
	        	    new google.maps.Point(0, 0),
	        	    new google.maps.Point(10, 34),
	        	    new google.maps.Size(21,34));
		return image;
	};
	defaultIcon = makeImage('0091ff');
	highlightedIcon = makeImage('FFFF24');
};
/* Onerror on map loading */
function mapError() {
	alert("Map Couldn't be loaded");
};

var viewModel = function() {
	var self = this;
	this.restaurants = ko.observableArray([]);
	this.filterText = ko.observable('');
	/* Showing all Markers on the map */
	this.showListings = function() {
		listings = true;
		var markers = [];
		var bounds = new google.maps.LatLngBounds();
		markers = makeMarker(locations);
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
			bounds.extend(markers[i].position);
		}
		map.fitBounds(bounds);
		mainMarkers = markers;
	};
	/* Remove all the Markers from the map */
	this.hideListings = function() {
		listings = false;
		for (var i = 0; i < mainMarkers.length; i++) {
			mainMarkers[i].setMap(null);
		}
	};
	/* open InfoWindow when clicked on a location from a list*/
	this.openInfo = function(clickedLoc) {
		var bounds = new google.maps.LatLngBounds();
		for(var i=0; i<mainMarkers.length; i++){
			if(clickedLoc.title == mainMarkers[i].title){
				if(!listings){
					mainMarkers[i].setMap(map)
				}
				bounds.extend(mainMarkers[i].position);
				mainMarkers[i].setIcon(highlightedIcon);
				if(mainMarkers[i].getAnimation() !== null){
					mainMarkers[i].setAnimation(null);
				}else{
					mainMarkers[i].setAnimation(google.maps.Animation.BOUNCE);
				}
				populateInfoWindow(mainMarkers[i], map, clickedLoc.location, largeInfoWindow);
			}
		}
	};
	/* Filter the locations based on the input given
	   is present in Locations title */
	self.restaurants = ko.computed(function(){
		var text = this.filterText().toLowerCase();
		if(!text){
			return locations;
		}else{
			return ko.utils.arrayFilter(locations, function(location){
				return location.title.toLowerCase().indexOf(text) !== -1;
			})
		}
	}, this);
	/* Display filtered markers on map when filter button is clicked */
	this.filterList = function(){
		var bounds = new google.maps.LatLngBounds();
		var markers = makeMarker(this.restaurants());
		for(var i=0; i< markers.length; i++){
			markers[i].setMap(map);
			bounds.extend(markers[i].position);
		}
		map.fitBounds(bounds);
	};

	/* Click on Hamburger icon */
	this.onClick = function() {
		var elem = $('.container');
		$('.container').toggleClass('show');
		if (!elem.hasClass('show')) {
			$('#map').css('z-index', 2);
		} else {
			$('#map').css('z-index', '');
		}
	};
}
ko.applyBindings(new viewModel());