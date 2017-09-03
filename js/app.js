// Coffee shops near my office
var map;
var markers = [];

// list of locations
var locations = [
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

// Data model for location
var Location = function(data){
    this.id = data.id;
    this.title = data.title;
    this.location = data.location;
    this.active = ko.observable(false);
    this.filtered = ko.observable(true);
};

var ViewModel = function() {
    var self = this;
    this.locationList = ko.observableArray([]);

    // Make a location list from location data
    locations.forEach(function(location){
        self.locationList.push( new Location(location) );
    });

    // Change a class based on states
    self.styling = function(location){
        if (!location.filtered()){
            return 'hide';
        } else if (location.active()){
            return 'active';
        } else {
            return '';
        }
    };

    // Filitering location with a keyword
    this.filterLocation = function(){
        // Get a keyword
        var keyword = document.getElementById("input").value.toLowerCase();
        // Make a list, filtering them based on the keyword in the input form
        self.locationList().forEach(function(location){
            location.active(false);
            if (keyword === "" || location.title.toLowerCase().includes(keyword)) {
                location.filtered(true);
                // make a filtered location visible on a map
                markers[location.id].setVisible(true);
            } else {
                location.filtered(false);
                // make a filtered-out location invisible
                markers[location.id].setVisible(false);
            }
        });
        fitToScreen();
    };

    // Change a state when clicking a location in a list
    self.selectLocation = function(clickedTab){
        self.locationList().forEach(function(location){
            if (location.id == clickedTab.id) {
                clickedTab.active(!clickedTab.active());
                google.maps.event.trigger(markers[location.id], 'click');
            } else {
                location.active(false);
            }
        });
    };
};

ko.applyBindings(new ViewModel());

// Handle google map
var initMap = function() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: locations[0].location,
        zoom: 13
    });

    var largeInfowindow = new google.maps.InfoWindow();

    // Add locations to the map
    for (var i = 0; i < locations.length; i++) {
        var location = locations[i];
        var marker = makeMarker(location);
        markers.push(marker);
        addEvents(location, marker, largeInfowindow);
    }
    fitToScreen();
};

// Add events to Google Map
var addEvents = function(location, marker, infowindow) {
    marker.addListener('click', function() {
        populateInfoWindow(this, infowindow);
    });
    marker.addListener('dblclick', function(){
        getPhotosFromFlickr(location, function(err, data) {
            if (err !== null) {
                alert('Something went wrong: ' + err);
            } else {
                showPhotos(data);
            }
        });
    });
};

// Set uo marker based on a location
var makeMarker = function(location) {
    var marker = new google.maps.Marker({
        map: map,
        position: location.location,
        title: location.title,
        animation: google.maps.Animation.DROP,
        id: location.id
    });
    return marker;
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
var populateInfoWindow = function(marker, infowindow) {
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
};

// Zoom in or out based on visible locations
var fitToScreen = function(){
    var bounds = new google.maps.LatLngBounds();
    for (var i=0; i < markers.length; i++) {
        if (markers[i].visible){
            bounds.extend(markers[i].position);
        }
    }
    map.fitBounds(bounds);
};

// Get photos near the location
var getPhotosFromFlickr = function(location, callback){
    var url = urlForFlickrSearch(location);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
    var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

// make a url for searching photos near the location
var urlForFlickrSearch = function(location){
    var key = "75d403097c79709e77f3b8a0470359d5";
    var url = " https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=";
    url += key;
    url += "&lat=";
    url += location.location.lat;
    url += "&lon=";
    url += location.location.lng;
    url += "&radius=0.01&per_page=100&page=1&format=json&nojsoncallback=1";
    return url;
};

// make a url of a randomly picked image
var urlForFlickrImg = function(data, int) {
    var photo = data.photos.photo[int];
    var url = "http://farm";
    url += photo.farm;
    url += ".staticflickr.com/";
    url += photo.server;
    url += "/";
    url += photo.id;
    url += "_";
    url += photo.secret;
    url += ".jpg";
    return url;
};

// show an randomly picked image with modal
var showPhotos = function(json){
    // Pick a random photo from results
    var length = json.photos.photo.length;
    var int = Math.floor(Math.random() * (length+1));

    // Get the modal
    var modal = document.getElementById('myModal');

    // Get the image and insert it inside the modal - use its "title"" text as a caption
    var modalImg = document.getElementById("img01");
    var captionText = document.getElementById("caption");
    modal.style.display = "block";
    modalImg.src = urlForFlickrImg(json, int);
    captionText.innerHTML = json.photos.photo[int].title;

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    };
};
