# Neighborhood-Map

Neighbourhood Map project is a single page application featuring a map of our neighborhood. It has added functionality like map markers to identify popular locations, a search function to easily discover these locations, listview to support simple browsing of all locations and Information about the locations.

It is built with the help of Knockout framework.

## Files in the Project
1. js - It has javascript files
	1. app.js - it has the ViewModel of the project.
	2. jQuery.js - Jquery library.
	3. lib - It contains knockout library `knockout-3.4.2`.
2. styles - It has stylesheet. myapp.css.
3. index.html - It has the DOM implementation.

## Execution of the Project
1. Download the project.
2. Open `index.html` in the browser or double click on `index.html`.
3. Desktop View:
	1. Click on `Show Listings` button to see all the markers on the map.
	2. Click on `Hide Listings` button to hide the markers from the map.
	3. To see the information on a particular location, click on the marker on the map.
	4. If markers are already present on the map, and you click on a particular location from the list then it will open the infowindow of that particular location on the map.
	5. If markers are not present on the map, then on a click on a location will set a marker on the map and will populate the infoWindow.
	6. To Filter the locations, provide input in the input field and click the `Filter` button.
4. Mobile View:
	1. Click on the Hamburger icon to view the list.
	2. Perform the action required.(1-6 steps from Desktop View)
	3. Click on the Hamburger Icon to hide the list and view the map.



