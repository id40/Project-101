const LOCATIONS = [
  {id:"lpu", name:"Lovely Professional University Main Campus", type:"Academic", lat:31.2559, lng:75.7051, description:"Main LPU academic campus and central hub for student activities, administration, and learning spaces.", facilities:["WiFi","Security","Accessibility","Parking"], departments:["Administration","Academic Blocks"], floors:"—", hours:"8:00 AM - 8:00 PM"},
  {id:"block32", name:"Block 32", type:"Academic", lat:31.2570, lng:75.7042, description:"Academic block for classrooms, laboratories, and faculty support facilities.", facilities:["Classrooms","Labs","Washrooms","Water"], departments:["Computer Science","Engineering"], floors:"4", hours:"9:00 AM - 6:00 PM"},
  {id:"central-library", name:"Central Library", type:"Library", lat:31.2550, lng:75.7060, description:"Main library building with study spaces, reference resources, and digital learning support.", facilities:["Books","Study Areas","WiFi","Computers","Reading Halls"], departments:["Library Services"], floors:"3", hours:"8:30 AM - 9:00 PM"},
  {id:"sports", name:"LPU Sports Complex", type:"Sports", lat:31.2542, lng:75.7018, description:"Outdoor sports and recreation area for training, matches, and campus fitness activities.", facilities:["Sports Ground","Changing Rooms","Running Track"], departments:["Sports Office"], floors:"—", hours:"6:00 AM - 8:00 PM"},
  {id:"hostel", name:"University Hostel Complex", type:"Hostel", lat:31.2583, lng:75.7090, description:"Student residence area with accommodation, security, and support services.", facilities:["Accommodation","Security","Food","Laundry"], departments:["Hostel Services"], floors:"5", hours:"24 Hours"},
  {id:"food", name:"Campus Food Court", type:"Food", lat:31.2538, lng:75.7072, description:"Student dining and food court area with quick meals and seating spaces.", facilities:["Food","Seating","Water","Vending"], departments:["Food Services"], floors:"—", hours:"10:00 AM - 11:00 PM"}
];

let map, selected, directionsRenderer, userMarker;
let markers = new Map();

function initMap() {
  const mapNode = document.getElementById("map");
  if (!mapNode || typeof L === 'undefined') {
    toast("Map library failed to load. Check your internet connection and reload the page.");
    return;
  }

  map = L.map(mapNode, { zoomControl: true, attributionControl: true }).setView([31.2559,75.7051], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const pinIcon = L.divIcon({
    className: 'map-pin-wrap',
    html: '<span class="map-pin"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  LOCATIONS.forEach(location => {
    const marker = L.marker([location.lat, location.lng], { icon: pinIcon, title: location.name }).addTo(map);
    marker.bindPopup(`<strong>${escapeHtml(location.name)}</strong><br>${escapeHtml(location.type)}`);
    marker.on('click', () => selectLocation(location));
    markers.set(location.id, marker);
  });

  setupUI();
  populateRouteSelects();
}

function selectLocation(location) {
  selected = location;
  map.setView([location.lat, location.lng], Math.max(map.getZoom(), 17));

  if (markers.has(location.id)) {
    markers.get(location.id).openPopup();
  }

  document.getElementById("empty-state").classList.add("hidden");
  document.getElementById("details").classList.remove("hidden");

  document.getElementById("detail-category").textContent = location.type;
  document.getElementById("detail-name").textContent = location.name;
  document.getElementById("detail-description").textContent = location.description;
  document.getElementById("detail-facilities").innerHTML = location.facilities.map(x => `<span class="chip">${escapeHtml(x)}</span>`).join("");
  document.getElementById("detail-departments").textContent = location.departments.join(" • ");
  document.getElementById("detail-floors").textContent = location.floors;
  document.getElementById("detail-hours").textContent = location.hours;

  const floorList = document.getElementById("floor-list");
  floorList.innerHTML = location.floors === "—" ? "<span style='color:var(--muted)'>Floor data not applicable.</span>" :
    ["Ground Floor","1st Floor","2nd Floor","3rd Floor","4th Floor"].slice(0, Number(location.floors) || 5)
      .map(f => `<button class="floor">${f}</button>`).join("");

  renderNearby(location);
}

function renderNearby(location) {
  const nearby = LOCATIONS.filter(x => x.id !== location.id)
    .map(x => ({x, d: distanceKm(location.lat,location.lng,x.lat,x.lng)}))
    .sort((a,b)=>a.d-b.d).slice(0,4);

  document.getElementById("nearby-list").innerHTML = nearby.map(({x,d}) =>
    `<div class="nearby-item"><span>${escapeHtml(x.name)}</span><span>${(d*1000).toFixed(0)} m</span></div>`
  ).join("");
}

function setupUI() {
  const search = document.getElementById("search");
  const results = document.getElementById("search-results");

  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    if (!q) { results.style.display="none"; return; }
    const matches = LOCATIONS.filter(x => (x.name+" "+x.type+" "+x.departments.join(" ")).toLowerCase().includes(q)).slice(0,8);
    results.innerHTML = matches.length ? matches.map(x =>
      `<div class="result" data-id="${x.id}"><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.type)}</small></div>`
    ).join("") : `<div class="result">No matching location.</div>`;
    results.style.display = "block";
    results.querySelectorAll("[data-id]").forEach(el => el.addEventListener("click", () => {
      const loc = LOCATIONS.find(x=>x.id===el.dataset.id);
      search.value = loc.name; results.style.display="none"; selectLocation(loc);
    }));
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap")) results.style.display="none";
  });

  document.getElementById("close-details").onclick = () => {
    document.getElementById("details").classList.add("hidden");
    document.getElementById("empty-state").classList.remove("hidden");
    LOCATIONS.forEach(loc => markers.get(loc.id)?.closePopup());
  };

  document.getElementById("dark-btn").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("lpu-dark", document.body.classList.contains("dark"));
  };
  if (localStorage.getItem("lpu-dark")==="true") document.body.classList.add("dark");

  document.getElementById("fullscreen-btn").onclick = () => {
    document.documentElement.requestFullscreen?.();
  };

  document.getElementById("reset-btn").onclick = () => {
    map.setView([31.2559,75.7051], 16);
  };

  document.getElementById("locate-btn").onclick = locateUser;
  document.getElementById("nearby-btn").onclick = nearbyFromUser;
  document.getElementById("route-btn").onclick = () => openRouteModal(selected?.id);
  document.getElementById("directions-from-here").onclick = () => openRouteModal();
  document.getElementById("close-route").onclick = () => document.getElementById("route-modal").classList.add("hidden");
  document.getElementById("start-route").onclick = buildRoute;

  document.getElementById("favorite-btn").onclick = () => {
    if (!selected) return;
    const key="lpu-favorites";
    const saved=JSON.parse(localStorage.getItem(key)||"[]");
    const i=saved.indexOf(selected.id);
    if(i>=0){saved.splice(i,1); toast("Removed from saved places");}
    else {saved.push(selected.id); toast("Saved place");}
    localStorage.setItem(key,JSON.stringify(saved));
  };

  document.getElementById("legend-toggle").onclick = () => {
    const el=document.getElementById("legend-content");
    el.style.display=el.style.display==="none" ? "block" : "none";
  };
}

function populateRouteSelects() {
  const from=document.getElementById("from-select"), to=document.getElementById("to-select");
  const options=LOCATIONS.map(x=>`<option value="${x.id}">${escapeHtml(x.name)}</option>`).join("");
  from.innerHTML=`<option value="user">My location</option>${options}`;
  to.innerHTML=options;
}

function openRouteModal(toId) {
  const modal=document.getElementById("route-modal");
  modal.classList.remove("hidden");
  if(toId) document.getElementById("to-select").value=toId;
}

function getWalkingRoutePoints(startLatLng, endLatLng) {
  const start = L.latLng(startLatLng);
  const end = L.latLng(endLatLng);
  const midLat = (start.lat + end.lat) / 2;
  const lngOffset = Math.abs(end.lng - start.lng) * 0.35;

  return [
    [start.lat, start.lng],
    [midLat + 0.0012, start.lng + lngOffset * 0.4],
    [midLat - 0.0010, end.lng - lngOffset * 0.25],
    [end.lat, end.lng]
  ];
}

function buildRoute() {
  const fromId=document.getElementById("from-select").value;
  const toId=document.getElementById("to-select").value;
  const to=LOCATIONS.find(x=>x.id===toId);
  if(!to) return;

  if (directionsRenderer) {
    map.removeLayer(directionsRenderer);
    directionsRenderer = null;
  }

  let origin;
  if(fromId === "user" && userMarker) {
    origin = userMarker.getLatLng();
  } else {
    const from = LOCATIONS.find(x => x.id === fromId) || selected;
    if(!from) return;
    origin = L.latLng(from.lat, from.lng);
  }

  const routePoints = getWalkingRoutePoints(origin, [to.lat, to.lng]);
  const totalDistance = routePoints.reduce((sum, point, idx, arr) => {
    if (idx === 0) return 0;
    const prev = arr[idx - 1];
    return sum + distanceKm(prev[0], prev[1], point[0], point[1]);
  }, 0);

  directionsRenderer = L.polyline(routePoints, {color: '#5b35d5', weight: 5, opacity: 0.95}).addTo(map);
  map.fitBounds(L.latLngBounds(routePoints), {padding: [50, 50]});
  document.getElementById("route-summary").innerHTML =
    `<strong>${totalDistance.toFixed(2)} km</strong> · walking route to ${escapeHtml(to.name)}`;
  document.getElementById("route-modal").classList.add("hidden");
}

function locateUser() {
  if(!navigator.geolocation){toast("Geolocation is not supported.");return;}
  navigator.geolocation.getCurrentPosition(pos=>{
    const p=[pos.coords.latitude,pos.coords.longitude];
    if(userMarker) {
      userMarker.setLatLng(p);
    } else {
      userMarker = L.marker(p, {title:"Your location"}).addTo(map);
    }
    map.setView(p, 17);
    toast("Your location is shown on the map.");
  },()=>toast("Location permission was denied or unavailable."));
}

function nearbyFromUser() {
  if(!navigator.geolocation){toast("Geolocation is not supported.");return;}
  navigator.geolocation.getCurrentPosition(pos=>{
    const p=[pos.coords.latitude,pos.coords.longitude];
    const nearby=LOCATIONS.map(x=>({x,d:distanceKm(p[0],p[1],x.lat,x.lng)})).sort((a,b)=>a.d-b.d).slice(0,8);
    const text=nearby.map(({x,d})=>`${x.name}: ${(d*1000).toFixed(0)} m`).join("\n");
    toast("Nearest places:\n"+text);
    if(userMarker) userMarker.setLatLng(p);
    else userMarker = L.marker(p, {title:"Your location"}).addTo(map);
    map.setView(p, 15);
  },()=>toast("Allow location access to find nearby places."));
}

function distanceKm(a,b,c,d){
  const R=6371, r=Math.PI/180;
  const x=(c-a)*r, y=(d-b)*r;
  const h=Math.sin(x/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function toast(message){
  const t=document.getElementById("toast"); t.textContent=message; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),3000);
}

window.addEventListener("load", initMap);
