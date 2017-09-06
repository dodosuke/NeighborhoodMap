// Coffee shops near my office
var map;
var markers = [];

var locations = [
    {"id": 0, "title": "Beck's Cofee Shop", "location": {"lat":35.698453, "lng":139.773124}},
    {"id": 1, "title": "Doutor Coffee Asakusabashi Minami", "location": {"lat":35.696891, "lng":139.78579}},
    {"id": 2, "title": "Doutor Coffee Sotokanda 1-Chome", "location": {"lat":35.69948, "lng":139.769592}},
    {"id": 3, "title": "Kanda Coffee Gardens Kanda North Exit", "location": {"lat":35.692068, "lng":139.770783}},
    {"id": 4, "title": "Doutor Coffee Kodenmacho", "location": {"lat":35.69188, "lng":139.780125}},
    {"id": 5, "title": "Yanaka Coffee", "location": {"lat":35.687093, "lng":139.774801}},
    {"id": 6, "title": "Starbucks Tokyo Medical and Dental University", "location": {"lat":35.70108, "lng":139.764298}},
    {"id": 7, "title": "Starbucks Coffee Tokyo Station City Sapia Tower", "location": {"lat":35.68371, "lng":139.768564}},
    {"id": 8, "title": "Ueshima Coffee Jinbocho", "location": {"lat":35.695467, "lng":139.760615}},
    {"id": 9, "title": "Streamer Coffee Company Kayabacho", "location": {"lat":35.682609, "lng":139.781424}},
    {"id": 10, "title": "Glitch Coffee and Roasters", "location": {"lat":35.693743, "lng":139.761305}},
    {"id": 11, "title": "Starbucks Coffee Akihabara Station", "location": {"lat": 35.697823, "lng":139.773696}},
    {"id": 12, "title": "Marufuku Coffee", "location": {"lat":35.698655, "lng":139.77485}},
    {"id": 13, "title": "Yanaka Coffee Kanda", "location": {"lat": 35.695414, "lng":139.767031}},
    {"id": 14, "title": "Segafredo", "location": {"lat":35.703116, "lng":139.771344}},
    {"id": 15, "title": "Berth Coffee", "location": {"lat":35.691571, "lng":139.781352}},
    {"id": 16, "title": "Miyakoshiya Coffee", "location": {"lat": 35.685057, "lng":139.774075}},
    {"id": 17, "title": "Inoda Coffee", "location": {"lat":35.681434, "lng":139.769206}}
];

// Data model for location
var Location = function(data){
    this.id = data.id;
    this.title = data.title;
    this.location = data.location;
    this.active = ko.observable(false);
};

// ViewModel to handle list
var ViewModel = function() {
    var self = this;

    // Set observables
    self.locationArray = ko.observableArray();
    self.keyword = ko.observable();
    self.url = ko.observable('');
    self.mode = ko.observable('none');
    self.caption = ko.observable('');

    // Make a location list from location data
    locations.forEach(function(location){
        self.locationArray.push( new Location(location) );
    });

    // Change a class based on states
    self.styling = function(location){
        if (location.active()){
            return 'active';
        } else {
            return '';
        }
    };

    // Live search function
    self.locationList = ko.computed(function(){
        var result;
        if (!self.keyword()) {
            for (var i=0; i < markers.length; i++) {markers[i].setVisible(true);}
            return self.locationArray();
        } else {
            return ko.utils.arrayFilter(self.locationArray(), function(location) {
                result = (location.title.toLowerCase().indexOf(self.keyword().toLowerCase()));
                // If location title contains a keyword, make the pin visible and leave in the list
                if (result !== -1) {
                    markers[location.id].setVisible(true);
                    return true;
                } else {
                    markers[location.id].setVisible(false);
                    return false;
                }
            });
        }
    });

    // Change a state when clicking a location in a list
    self.selectLocation = function(clickedTab){
        self.locationList().forEach(function(location){
            // If click a clicked tab, call double click from google map
            if (location.id === clickedTab.id && clickedTab.active()) {
                google.maps.event.trigger(markers[location.id], 'dblclick');
            // Make a list active and call click from google map
            } else if (location.id === clickedTab.id && !clickedTab.active()) {
                clickedTab.active(!clickedTab.active());
                google.maps.event.trigger(markers[location.id], 'click');
            } else {
            // Make the other location tabs inactive
                location.active(false);
            }
        });
    };
};



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

// Set up a marker based on a location
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

// Add events to Google Map
var addEvents = function(location, marker, infowindow) {
    marker.addListener('click', function() {
        populateInfoWindow(this, infowindow);
    });
    marker.addListener('dblclick', function(){
        getPhotosFromFlickr(location);
    });
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
var populateInfoWindow = function(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){marker.setAnimation(null);}, 700);
    }
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

// Error handler for loading Google Map
var mapError = function(){
    alert('Looks like there was a problem in loading google map');
};


// Get photos near the location using Flickr API
var getPhotosFromFlickr = function(location){
    var url = urlForFlickrSearch(location);

    fetch(url)
    .then(function(response) {
        if (!response.ok) {
            alert('Network response was not ok.');
        } else if (response.status !== 200) {
            alert('Looks like there was a problem. Status Code: ' +  response.status);
        }
        // Examine the text in the response
        response.json().then(function(data) {
            showPhotos(data);
        });
    })
    .catch(function(err) {
        alert('Fetch Error :-S', err);
    });
};

// make a url for searching photos near the location
var urlForFlickrSearch = function(location){
    var key = "75d403097c79709e77f3b8a0470359d5";
    var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=";
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

var showPhotos = function(json){
    // Pick a random photo from results
    var length = json.photos.photo.length;
    var int = Math.floor(Math.random() * (length+1));

    // Update observables
    vm.url(urlForFlickrImg(json, int));
    vm.caption(json.photos.photo[int].title);
    vm.mode("block");

    // When the user clicks on <span> (x), close the modal
    vm.closeModal = function() {
        vm.mode("none");
    };
};

var vm = new ViewModel();
ko.applyBindings(vm);
