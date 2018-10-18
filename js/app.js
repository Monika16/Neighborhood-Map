/* List of locations to be shown on map */
var locations = [
	{
		title:'Samburna Indian Restaurant',
		location: {
			lat: 47.809221125403,
			lng: -122.208753930654
		}
	},
	{
		title:'Dine India',
		location: {
			lat: 47.811073,
			lng: -122.207404
		}
	},
	{
		title:'Namasthe Indian Restaurant',
		location: {
			lat: 47.7903,
			lng: -122.2195
		}
	},
	{
		title:'Hyderabad House',
		location: {
			lat: 47.7798,
			lng: -122.2197
		}
	},
	{
		title:'Ruchi Indian Restaurant',
		location: {
			lat: 47.83525,
			lng: -122.20988
		}
	}
];
/* Show listings is on or off default off */
var listings = false;
/* Yelp Key to access info from Yelp*/
var yelp_key ="oTb6ms6uQPyfpXxz6sTGIq5hHX3bePLmKGottlLE"+
			  "l7C8IIM6FO2WmgXIN7962QssDot2PQiS0wrSxCEpn3"+
			  "xABj0_WQJZ5ZJw9XFn6JJ4-TGYnzBacdimzTX2fV61W3Yx";
/* Store Markers */
var markers=[];

/* To create infowindow when a marker is clicked */
function populateInfoWindow(marker, map, position, infowindow){
	if( infowindow.marker != marker) {
		infowindow.marker = marker;
		var term = marker.title.substr(0,marker.title.indexOf(' '));
		var idurl = "https://cors-anywhere.herokuapp.com/https:"+
					"//api.yelp.com/v3/businesses/search?term="+term+
					"&latitude="+position.lat+"&longitude="+position.lng;
		/* Ajax request to get information from Yelp */
		$.ajax({
			"async": true,
	        "crossDomain": true,
			"url": idurl,
			"headers": {
				"Authorization": 'Bearer '+yelp_key,
			},
			"dataType":"json",
			success: function(data){
				var review = data.businesses[0];
				/* Address in InfoWindow */
				var address = review.location.address1+" "+
							  review.location.address2+" "+
							  review.location.address3+" "+
							  review.location.city+" "+
							  review.location.state+" "+
							  review.location.zip_code;
				infowindow.setContent('<div id=\"content\"><h3>'+ review.name +
									  '</h3><p><strong>Address: </strong>'+
									   address+'</p><p><strong>Rating: </strong>'+
									   review.rating+'</p><img id="rimg" src="'+
									   review.image_url+'" alt="'+review.name+'"></div>');
				infowindow.open(map, marker);
				infowindow.addListener('closeclick', function() {
	            	infowindow.marker = null;
	        	});
			},
			error: function(data){
				console.log(data);
			}
		});
	};
};

var viewModel = function(){
	var self = this;
	this.restaurants = ko.observableArray([]);
	this.filterText = ko.observable('');

	var map = new google.maps.Map(document.getElementById('map'),{
		center: {lat: 47.776857, lng: -122.204997},
		zoom: 13
	});

	var largeInfoWindow = new google.maps.InfoWindow();

	/* Marker Image */
	var image = {
		url: 'http://chart.apis.google.com/chart?'+
			 'chst=d_map_pin_letter&chld=%E2%80%A2|FE7569',
		size: new google.maps.Size(21,32),
		origin: new google.maps.Point(0,0),
		anchor: new google.maps.Point(0,32)
	};

	/* Creating Markers for the locations */
	for(var i= 0; i< locations.length; i++){
		var title = locations[i].title;
		var position = locations[i].location;
		var marker = new google.maps.Marker({
			title: title,
			position: position,
			icon: image,
			animation: google.maps.Animation.DROP,
			id: i
		});

		markers.push(marker);
		marker.addListener('click',function(){
			populateInfoWindow(this, map, position, largeInfoWindow);
		});
	};

	/* Showing all Markers on the map */
	this.showListings = function(){
		listings = true;
		var bounds = new google.maps.LatLngBounds();
		for(var i=0; i<markers.length; i++){
			markers[i].setMap(map);
			bounds.extend(markers[i].position);
		}
		map.fitBounds(bounds);
		self.restaurants.removeAll();
		locations.forEach(function(location){
			self.restaurants.push(location);
		});
	};

	/* Remove all the Markers from the map */
	this.hideListings = function(){
		listings=false;
		for(var i=0; i<markers.length; i++){
			markers[i].setMap(null);
		}
	}

	locations.forEach(function(location){
		self.restaurants.push(location);
	});

	/* Set Marker when clicked on a location from a list*/
	this.setMarker = function(clickedLoc){
		var bounds = new google.maps.LatLngBounds();
		var position = {};
		for(var i=0; i<markers.length; i++){
			if(clickedLoc.title == markers[i].title){
				/* if show Listings button is already pressed, then 
				infowindow of the clicked location is open */
				if(listings){
					position.lat=markers[i].getPosition().lat();
					position.lng=markers[i].getPosition().lng();
					populateInfoWindow(markers[i], map, position, largeInfoWindow);
				}
				/* else the Marker for the clicked location in set*/
				else{
					markers[i].setMap(map);
				}
			}
			bounds.extend(markers[i].position);
		}
		map.fitBounds(bounds);
	}
	/* Filter the locations based on the input given
	   is present in Locations title */
	this.filterList = function(){
		self.restaurants.removeAll();
		var bounds = new google.maps.LatLngBounds();
		for(var i=0; i<locations.length; i++){
			markers[i].setMap(null);
			if((locations[i].title).includes(self.filterText())){
				listings = true;
				self.restaurants.push(locations[i]);
				for(var j=0; j<markers.length; j++){
					if(locations[i].title == markers[j].title){
						markers[j].setMap(map);
					}
					bounds.extend(markers[j].position);
				}
			}
		}
		self.filterText('');
		map.fitBounds(bounds);
	}
	/* Click on Hamburger icon */
	this.onClick = function(){
		var elem = $('.container');
		$('.container').toggleClass('show');
		if(!elem.hasClass('show')){
			$('#map').css('z-index',2);
		}else{
			$('#map').css('z-index', '');
		}
	}
}


ko.applyBindings(new viewModel());

 
