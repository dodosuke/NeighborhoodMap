// Coffee shops near my office
var map;
var markers = [];

let locations = [
    {id: 0, title: "Beck's Cofee Shop", location: {lat:35.698453, lng:139.773124}},
    {id: 1, title: "Doutor Coffee Asakusabashi Minami", location: {lat:35.696891, lng:139.78579}},
    {id: 2, title: "Doutor Coffee Sotokanda 1-Chome", location: {lat:35.69948, lng:139.769592}},
    {id: 3, title: "Kanda Coffee Gardens Kanda North Exit", location: {lat:35.692068, lng:139.770783}},
    {id: 4, title: "Doutor Coffee Kodenmacho", location: {lat:35.69188, lng:139.780125}},
    {id: 5, title: "Yanaka Coffee", location: {lat:35.687093, lng:139.774801}},
    {id: 6, title: "Starbucks Tokyo Medical and Dental University", location: {lat:35.70108, lng:139.764298}},
    {id: 7, title: "Starbucks Coffee Tokyo Station City Sapia Tower", location: {lat:35.68371, lng:139.768564}},
    {id: 8, title: "Ueshima Coffee Jinbocho", location: {lat:35.695467, lng:139.760615}},
    {id: 9, title: "Streamer Coffee Company Kayabacho", location: {lat:35.682609, lng:139.781424}},
    {id: 10, title: "Glitch Coffee and Roasters", location: {lat:35.693743, lng:139.761305}},
    {id: 11, title: "Starbucks Coffee Akihabara Station", location: {lat: 35.697823, lng:139.773696}},
    {id: 12, title: "Marufuku Coffee", location: {lat:35.698655, lng:139.77485}},
    {id: 13, title: "Yanaka Coffee Kanda", location: {lat: 35.695414, lng:139.767031}},
    {id: 14, title: "Segafredo", location: {lat:35.703116, lng:139.771344}},
    {id: 15, title: "Berth Coffee", location: {lat:35.691571, lng:139.781352}},
    {id: 16, title: "Miyakoshiya Coffee", location: {lat: 35.685057, lng:139.774075}},
    {id: 17, title: "Inoda Coffee", location: {lat:35.681434, lng:139.769206}}
];

var Location = function(data){
    this.id = data.id;
    this.title = data.title;
    this.location = data.location;
    this.active = ko.observable(false);
}

var ViewModel = function() {
    var self = this;
    this.locationList = ko.observableArray([]);

    locations.forEach(function(location){
        self.locationList.push( new Location(location) );
    });

    // Filitering function
    this.filterLocation = function(){
        //initialize the locationList
        self.locationList.removeAll();

        // Get a filtering word in the input form
        var keyword = document.getElementById("input").value.toLowerCase();

        // Make a list, filtering them based on the keyword in the input form
        locations.forEach(function(location){
            if (keyword == "" || location.title.toLowerCase().includes(keyword)) {
                self.locationList.push( new Location(location) );
            }
        });
    };

    self.styling = function(location){
        if (location.active() == true){
            return 'active';
        } else {
            return '';
        }
    };

    self.selectLocation = function(clickedTab){
        self.locationList().forEach(function(location){
            if (location.id == clickedTab.id) {
                clickedTab.active(!clickedTab.active());
            } else {
                location.active(false);
            }
        });

    };
}

ko.applyBindings(new ViewModel());


var initMap = function(keyword="") {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 35.686329,lng: 139.764901},
        zoom: 13
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // Delete all stored markers to refresh
    markers = [];

    // Add locations, filtering them based on the keyword in the input form
    for (var i = 0; i < locations.length; i++) {
        var location = locations[i];
        if (keyword == "" || location.title.toLowerCase().includes(keyword)) {
//            makeList(location, i, largeInfowindow);
            makeLocation(location, largeInfowindow);
        }
    }

    // Create bounds for dispay
    for (var i=0; i < markers.length; i++) {
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// Make a list from "locations"
//function makeList(location, id, infowindow) {
//    var item = document.createElement("button");
//    item.id = id;
//    item.className = "locationTab"
//    item.onclick = function(){selectTab(event, item.id, infowindow);};
//    item.innerHTML = location.title;
//    document.getElementById("list").appendChild(item);
//}

// Put pins based on "locations"
function makeLocation(location, infowindow) {
    var position = location.location;
    var title = location.title;
    var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: location.id
    });
    markers.push(marker);
    marker.addListener('click', function() {
        populateInfoWindow(this, infowindow);
    });
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.setMarker = null;
        });
    }
}

//function filterLocation() {
    // Get a filtering word in the input form
//    var text = document.getElementById("input").value;

    //Get a list of locations
//    list = document.getElementById("list");

    // Remove all list first
//    while (list.hasChildNodes()) {
//        list.removeChild(list.firstChild);
//    }

    // Reload map with the filtering keyword
//    initMap(keyword=text.toLowerCase());
//}

function selectTab(evt, id, infowindow){
    // Get all elements with class="tablinks" and remove the class "active"
    var tablinks = document.getElementsByClassName("locationTab");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(id).style.display = "block";
    evt.currentTarget.className += " active";

    // Open an infowindow of a selected location
    for (i = 0; i < markers.length; i++) {
        if (markers[i].id == id) {
            infowindow.marker = markers[i];
            infowindow.setContent('<div>' + markers[i].title + '</div>');
            infowindow.open(map, markers[i]);
        }
    }
}
