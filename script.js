// Exact location
const latitude = 31.253313;
const longitude = 75.70327;

// Create the map
const map = L.map("map").setView([latitude, longitude], 16);

// Add OpenStreetMap map tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// Add location marker
L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(`
        <b>My Location</b><br>
        Phagwara, Punjab
    `)
    .openPopup();
