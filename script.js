let map;
let geocoder;

// Define Amherst boundary limits
const AMHERST_BOUNDS = {
    north: 42.41,
    south: 42.33,
    west: -72.56,
    east: -72.46
};

// Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 42.3736, lng: -72.5199 }, // Amherst, MA
        zoom: 13,
        minZoom: 12, 
        maxZoom: 18, 
        mapTypeId: "hybrid",
        tilt: 45, 
        streetViewControl: true
    });

    geocoder = new google.maps.Geocoder();

    // Enforce panning limits
    google.maps.event.addListener(map, "dragend", function () {
        const center = map.getCenter();
        if (
            center.lat() > AMHERST_BOUNDS.north ||
            center.lat() < AMHERST_BOUNDS.south ||
            center.lng() > AMHERST_BOUNDS.east ||
            center.lng() < AMHERST_BOUNDS.west
        ) {
            map.panTo({
                lat: Math.min(Math.max(center.lat(), AMHERST_BOUNDS.south), AMHERST_BOUNDS.north),
                lng: Math.min(Math.max(center.lng(), AMHERST_BOUNDS.west), AMHERST_BOUNDS.east)
            });
        }
    });

    // Fetch existing locations from the backend
    fetch("http://localhost:5000/api/locations")
        .then(response => response.json())
        .then(data => {
            data.forEach(place => {
                addMarker(place);
            });
        })
        .catch(err => console.error("Error fetching locations:", err));
}

// Function to search for a location within Amherst
function searchLocation() {
    const searchQuery = document.getElementById("search-box").value.trim();
    
    if (!searchQuery) {
        alert("Please enter a location in Amherst.");
        return;
    }

    geocoder.geocode({ address: searchQuery, componentRestrictions: { country: "US", administrativeArea: "MA" } }, (results, status) => {
        if (status === "OK" && results.length > 0) {
            const location = results[0].geometry.location;
            
            // Check if the location is within Amherst boundaries
            if (
                location.lat() >= AMHERST_BOUNDS.south &&
                location.lat() <= AMHERST_BOUNDS.north &&
                location.lng() >= AMHERST_BOUNDS.west &&
                location.lng() <= AMHERST_BOUNDS.east
            ) {
                map.setCenter(location);
                map.setZoom(15);
            } else {
                alert("Please search within Amherst, MA.");
            }
        } else {
            alert("Location not found. Try again.");
        }
    });
}

// Function to add a marker for a location
function addMarker(place) {
    const iconUrl = place.rating === "safe"
        ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
        : "https://maps.google.com/mapfiles/ms/icons/red-dot.png";

    const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: map,
        title: `Rating: ${place.rating}`,
        icon: iconUrl
    });

    marker.addListener("click", () => {
        alert(`Safety Rating: ${place.rating}`);
    });
}

// Enable search with "Enter" key
document.getElementById("search-box").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchLocation();
    }
});

// Attach initMap function to the global window object
window.initMap = initMap;
