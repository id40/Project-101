/**
 * Lovely Professional University (LPU) - 3D Architectural Masterplan & Digital Twin
 * High-Performance Interactive Three.js Engine
 */

// Global State
const state = {
  data: null,
  buildings: [],
  buildingMeshes: new Map(),
  hoveredMesh: null,
  selectedBuilding: null,
  viewMode: 'isometric', // 'isometric', 'topdown', 'walk', 'tour'
  tourAngle: 0,
  isTouring: false,
  isMeasuring: false,
  measurePoints: [],
  measureLine: null,
  layers: {
    satellite: false,
    zoning: false,
    trees: true,
    solar: true,
    labels: true
  },
  timeOfDay: 14.0, // 2:00 PM
  walkControls: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    yaw: 0,
    pitch: 0,
    isMouseDown: false,
    prevMouseX: 0,
    prevMouseY: 0
  }
};

// Colors & Architectural Palette
const PALETTE = {
  ground: 0xf1f5f9,
  groundSat: 0x223322,
  road: 0x334155,
  walkway: 0x94a3b8,
  grass: 0x86efac,
  curb: 0xcfd8dc,
  academic: 0xf8fafc,
  residential: 0xfef3c7,
  sports: 0xfecaca,
  admin: 0xe0e7ff,
  solar: 0x1e3a8a,
  water: 0x38bdf8,
  hoverHighlight: 0x38bdf8,
  selectedHighlight: 0xf59e0b
};

const ZONING_COLORS = {
  'Academic': 0x34d399,
  'Residential': 0xfb923c,
  'Sports': 0xf87171,
  'Healthcare': 0xf43f5e,
  'Commercial & Dining': 0xfacc15,
  'Memorial & Park': 0x4ade80,
  'Civic / Gate': 0x60a5fa,
  'Transport': 0xa78bfa
};

// Three.js Core Objects
let scene, renderer, currentCamera, perspectiveCamera, orthoCamera, controls;
let dirLight, hemiLight, groundPlane, satelliteMesh, treeInstancedMesh, treeTrunkMesh, solarGroup, landmarkPinsGroup;
let measureMarkersGroup;
let groundTexture, roadTexture, walkwayTexture, facadeTexture;

function createSurfaceTexture(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const colors = {
    ground: ['#8eaa83', '#a9bd91', '#718d70'],
    road: ['#303b42', '#3f4a4f', '#263136'],
    walkway: ['#b7c0bc', '#d3d7d1', '#9ca8a5'],
    facade: ['#dfe6e3', '#b9c9c5', '#f3f5ed']
  };
  const palette = colors[kind];
  context.fillStyle = palette[0];
  context.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 3800; i += 1) {
    const shade = palette[i % palette.length];
    context.fillStyle = shade;
    context.globalAlpha = kind === 'road' ? 0.22 : 0.16;
    const size = kind === 'facade' ? 1 + (i % 3) : 1 + (i % 2);
    context.fillRect((i * 37) % 512, (i * 71) % 512, size, size);
  }

  context.globalAlpha = 1;
  if (kind === 'road') {
    context.strokeStyle = 'rgba(255,255,255,.32)';
    context.setLineDash([22, 18]);
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(256, 0);
    context.lineTo(256, 512);
    context.stroke();
    context.setLineDash([]);
  }
  if (kind === 'facade') {
    context.fillStyle = 'rgba(25,55,66,.28)';
    for (let y = 12; y < 512; y += 42) {
      for (let x = 8; x < 512; x += 28) {
        context.fillRect(x, y, 11, 18);
      }
    }
    context.strokeStyle = 'rgba(255,255,255,.28)';
    context.lineWidth = 2;
    for (let y = 0; y < 512; y += 42) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(512, y);
      context.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function getSurfaceTextures() {
  if (!groundTexture) {
    groundTexture = createSurfaceTexture('ground');
    roadTexture = createSurfaceTexture('road');
    walkwayTexture = createSurfaceTexture('walkway');
    facadeTexture = createSurfaceTexture('facade');
    groundTexture.repeat.set(9, 12);
    roadTexture.repeat.set(1, 8);
    walkwayTexture.repeat.set(1, 6);
    facadeTexture.repeat.set(2.5, 3.5);
  }
  return { groundTexture, roadTexture, walkwayTexture, facadeTexture };
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  initThree();
  loadData();
  setupUI();
  setupEvents();
  animate();
});

function initThree() {
  const container = document.getElementById('canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  // 1. Scene & Fog
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdbeafe);
  scene.fog = new THREE.FogExp2(0xdbeafe, 0.0006);

  // 2. Cameras
  // Perspective for 3D Isometric and Walk
  perspectiveCamera = new THREE.PerspectiveCamera(40, width / height, 1, 4000);
  // Default Elevated 40° Isometric Bird's-Eye View
  perspectiveCamera.position.set(360, 330, 470);

  // Orthographic for Plan / Top-Down View
  const aspect = width / height;
  const d = 550;
  orthoCamera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 4000);
  orthoCamera.position.set(0, 900, 0);
  orthoCamera.up.set(0, 0, -1);
  orthoCamera.lookAt(0, 0, 0);

  currentCamera = perspectiveCamera;

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;
  container.appendChild(renderer.domElement);

  // 4. OrbitControls
  controls = new THREE.OrbitControls(perspectiveCamera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 30;
  controls.maxDistance = 1800;
  controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera going beneath ground
  controls.target.set(0, 0, 0);

  // 5. Lighting
  setupLighting();

  // 6. Base Groups
  solarGroup = new THREE.Group();
  landmarkPinsGroup = new THREE.Group();
  measureMarkersGroup = new THREE.Group();
  scene.add(solarGroup);
  scene.add(landmarkPinsGroup);
  scene.add(measureMarkersGroup);

  // Window resize handler
  window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
  // Hemispheric soft ambient light
  hemiLight = new THREE.HemisphereLight(0xffffff, 0x647d78, 0.6);
  hemiLight.position.set(0, 500, 0);
  scene.add(hemiLight);

  // Directional Daylight Sun (Oriented diagonally to match satellite shadow angle)
  dirLight = new THREE.DirectionalLight(0xfffaed, 1.1);
  dirLight.position.set(-450, 600, -350);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 100;
  dirLight.shadow.camera.far = 1800;
  
  const d = 750;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.bias = -0.0004;
  scene.add(dirLight);
}

// --------------------------------------------------------------------------
// Data Loading & 3D Reconstruction
// --------------------------------------------------------------------------
async function loadData() {
  try {
    const res = await fetch('campus_data.json');
    state.data = await res.json();
    state.buildings = state.data.buildings;

    buildTerrainAndRoads();
    buildBuildings();
    buildSportsAndLandmarks();
    buildTrees();
    buildLandmarkPins();
    setupSatelliteBasemap();
    populateSearchDropdown();
  } catch (err) {
    console.error('Failed to load campus data:', err);
  }
}

function buildTerrainAndRoads() {
  const textures = getSurfaceTextures();
  // Master Ground Plane
  const groundGeo = new THREE.PlaneGeometry(2200, 2600);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: textures.groundTexture });
  groundPlane = new THREE.Mesh(groundGeo, groundMat);
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.y = -0.1;
  groundPlane.receiveShadow = true;
  scene.add(groundPlane);

  // Campus Lawn & Agricultural Green Zones (South & Parks)
  const lawnGeo = new THREE.PlaneGeometry(1600, 1900);
  const lawnMat = new THREE.MeshLambertMaterial({ color: 0xd2e5c9, map: textures.groundTexture });
  const lawn = new THREE.Mesh(lawnGeo, lawnMat);
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.set(20, -0.05, 50);
  lawn.receiveShadow = true;
  scene.add(lawn);

  // Roads and Walkways
  const roadMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: textures.roadTexture });
  const walkMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: textures.walkwayTexture });

  state.data.highways.forEach(hw => {
    const pts = hw.path;
    if (pts.length < 2) return;

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];

      const dx = p2[0] - p1[0];
      const dz = -(p2[1] - p1[1]);
      const len = Math.hypot(dx, dz);
      if (len < 0.5) continue;

      const angle = Math.atan2(dz, dx);
      const midX = (p1[0] + p2[0]) / 2;
      const midZ = -(p1[1] + p2[1]) / 2;

      const width = hw.width || (hw.is_primary ? 14 : 7);
      const segGeo = new THREE.PlaneGeometry(len, width);
      const segMesh = new THREE.Mesh(segGeo, hw.is_pedestrian ? walkMat : roadMat);
      segMesh.rotation.x = -Math.PI / 2;
      segMesh.rotation.z = -angle;
      segMesh.position.set(midX, hw.is_pedestrian ? 0.05 : 0.02, midZ);
      segMesh.receiveShadow = true;
      scene.add(segMesh);
    }
  });

  // Grand Entrance Boulevard Median & Curbs (Top North Sector)
  const medianGeo = new THREE.PlaneGeometry(12, 450);
  const medianMat = new THREE.MeshLambertMaterial({ color: 0x86efac });
  const median = new THREE.Mesh(medianGeo, medianMat);
  median.rotation.x = -Math.PI / 2;
  median.position.set(160, 0.1, -380);
  scene.add(median);
}

function buildBuildings() {
  const buildingGroup = new THREE.Group();

  state.buildings.forEach(b => {
    const poly = b.polygon;
    if (poly.length < 3) return;

    // Create 2D Shape from Footprint
    const shape = new THREE.Shape();
    shape.moveTo(poly[0][0], poly[0][1]);
    for (let i = 1; i < poly.length; i++) {
      shape.lineTo(poly[i][0], poly[i][1]);
    }
    shape.closePath();

    // Extrude geometry
    const extrudeSettings = {
      depth: b.height,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.4,
      bevelThickness: 0.4
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Rotate to lie on XZ plane
    geometry.rotateX(-Math.PI / 2);

    // Wall Material (Stylized pastel architectural finish)
    const baseColor = new THREE.Color(b.wall_color || PALETTE.academic);
    const material = new THREE.MeshStandardMaterial({
      color: baseColor,
      map: getSurfaceTextures().facadeTexture,
      roughness: 0.45,
      metalness: 0.05
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      isBuilding: true,
      data: b,
      originalColor: baseColor.clone()
    };

    buildingGroup.add(mesh);
    state.buildingMeshes.set(b.id, mesh);

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x49646b,
      transparent: true,
      opacity: 0.38
    });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 18), edgeMaterial);
    edges.userData = { isBuildingEdge: true };
    buildingGroup.add(edges);

    // Add Rooftop Solar Panel Canopy if applicable
    if (b.has_solar) {
      addRooftopSolar(b);
    }
  });

  scene.add(buildingGroup);
}

function addRooftopSolar(b) {
  const w = Math.min(Math.sqrt(b.area) * 0.7, 50);
  const solarGeo = new THREE.PlaneGeometry(w, w * 0.7, 6, 4);
  const solarMat = new THREE.MeshStandardMaterial({
    color: PALETTE.solar,
    roughness: 0.2,
    metalness: 0.85
  });
  const solarMesh = new THREE.Mesh(solarGeo, solarMat);
  solarMesh.rotation.x = -Math.PI / 2;
  solarMesh.position.set(b.center[0], b.height + 0.6, -b.center[1]);
  solarMesh.castShadow = true;
  solarGroup.add(solarMesh);
}

function buildSportsAndLandmarks() {
  const { cricket_stadium, amphitheater, samadhi_oval, sports_courts, stp_tanks, water_bodies, parking_lots } = state.data;

  // 1. Cricket Stadium (Screenshot 18)
  if (cricket_stadium) {
    const [cx, cy] = cricket_stadium.center;
    const r = cricket_stadium.radius;
    const cz = -cy; // Invert for North=-Z, South=+Z

    const ovalGeo = new THREE.CircleGeometry(r, 64);
    const ovalMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
    const oval = new THREE.Mesh(ovalGeo, ovalMat);
    oval.rotation.x = -Math.PI / 2;
    oval.position.set(cx, 0.08, cz);
    scene.add(oval);

    const trackGeo = new THREE.RingGeometry(r, r + 7, 64);
    const trackMat = new THREE.MeshLambertMaterial({ color: 0xe11d48 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.set(cx, 0.06, cz);
    scene.add(track);

    // Inner Pitch (clay strip)
    const pitchGeo = new THREE.PlaneGeometry(6, 24);
    const pitchMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.set(cx, 0.12, cz);
    scene.add(pitch);

    // Grandstand Spectator Canopies
    const standMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.5 });

    cricket_stadium.stands.forEach(st => {
      const standGroup = new THREE.Group();
      
      // Tiered steps
      const stepsGeo = new THREE.BoxGeometry(st.width, st.height * 0.7, st.depth);
      const stepsMesh = new THREE.Mesh(stepsGeo, seatMat);
      stepsMesh.position.y = st.height * 0.35;
      stepsMesh.castShadow = true;
      standGroup.add(stepsMesh);

      // Angled white canopy roof
      const roofGeo = new THREE.BoxGeometry(st.width * 1.05, 0.4, st.depth * 1.15);
      const roofMesh = new THREE.Mesh(roofGeo, standMat);
      roofMesh.position.set(0, st.height + 0.4, 0);
      roofMesh.rotation.x = -0.15;
      roofMesh.castShadow = true;
      standGroup.add(roofMesh);

      standGroup.position.set(st.x, 0, -st.y);
      standGroup.rotation.y = -st.rotation;
      scene.add(standGroup);
    });
  }

  // 2. Central Amphitheater (Screenshot 14)
  if (amphitheater) {
    const [ax, az] = amphitheater.center;
    const amphMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.6 });
    
    for (let t = 0; t < amphitheater.tiers; t++) {
      const innerR = 12 + t * 3.2;
      const outerR = innerR + 2.8;
      const tierGeo = new THREE.RingGeometry(innerR, outerR, 32, 1, amphitheater.start_angle, amphitheater.end_angle - amphitheater.start_angle);
      const tierMesh = new THREE.Mesh(tierGeo, amphMat);
      tierMesh.rotation.x = -Math.PI / 2;
      tierMesh.position.set(ax, 0.2 + t * 0.7, -az);
      tierMesh.castShadow = true;
      scene.add(tierMesh);
    }
  }

  // 3. Late Mrs. Mittal Samadhi Oval (Screenshot 11)
  if (samadhi_oval) {
    const [sx, sz] = samadhi_oval.center;
    // Sculpted green oval
    const samadhiGeo = new THREE.CircleGeometry(samadhi_oval.radius_x, 48);
    samadhiGeo.scale(1, samadhi_oval.radius_y / samadhi_oval.radius_x, 1);
    const samadhiMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
    const samadhi = new THREE.Mesh(samadhiGeo, samadhiMat);
    samadhi.rotation.x = -Math.PI / 2;
    samadhi.position.set(sx, 0.1, -sz);
    scene.add(samadhi);

    // Central Monument Pedestal
    const monGeo = new THREE.CylinderGeometry(5, 7, 3.5, 32);
    const monMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.2 });
    const mon = new THREE.Mesh(monGeo, monMat);
    mon.position.set(sx, 1.75, -sz);
    mon.castShadow = true;
    scene.add(mon);
  }

  // 4. Outdoor Sports Hardcourts (Screenshot 19)
  if (sports_courts) {
    sports_courts.forEach(sc => {
      const courtGeo = new THREE.PlaneGeometry(sc.w, sc.h);
      const courtMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(sc.color) });
      const court = new THREE.Mesh(courtGeo, courtMat);
      court.rotation.x = -Math.PI / 2;
      court.position.set(sc.x, 0.08, -sc.y);
      scene.add(court);

      // White perimeter line
      const borderGeo = new THREE.RingGeometry(sc.w * 0.48, sc.w * 0.5, 4);
      const borderMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.rotation.x = -Math.PI / 2;
      border.rotation.z = Math.PI / 4;
      border.position.set(sc.x, 0.09, -sc.y);
      scene.add(border);
    });
  }

  // 5. STP Clarifier Tanks (Screenshot 15)
  if (stp_tanks) {
    const stpWallMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    const stpWaterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.3 });

    stp_tanks.forEach(tank => {
      // Concrete rim
      const rimGeo = new THREE.CylinderGeometry(tank.radius, tank.radius, tank.height, 36, 1, true);
      const rim = new THREE.Mesh(rimGeo, stpWallMat);
      rim.position.set(tank.x, tank.height / 2, -tank.y);
      rim.castShadow = true;
      scene.add(rim);

      // Water top
      const waterGeo = new THREE.CircleGeometry(tank.radius - 0.4, 36);
      const water = new THREE.Mesh(waterGeo, stpWaterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(tank.x, tank.height - 0.3, -tank.y);
      scene.add(water);

      // Rotating steel bridge truss
      const trussGeo = new THREE.BoxGeometry(tank.radius * 2 - 1, 0.6, 1.2);
      const truss = new THREE.Mesh(trussGeo, stpWallMat);
      truss.position.set(tank.x, tank.height + 0.4, -tank.y);
      scene.add(truss);
    });
  }

  // 6. Water Bodies (South lake & reflection pond)
  if (water_bodies) {
    const waterMat = new THREE.MeshStandardMaterial({
      color: PALETTE.water,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    });

    water_bodies.forEach(wb => {
      const poly = wb.polygon;
      if (poly.length < 3) return;

      const shape = new THREE.Shape();
      shape.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < poly.length; i++) {
        shape.lineTo(poly[i][0], poly[i][1]);
      }
      shape.closePath();

      const waterGeo = new THREE.ShapeGeometry(shape);
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.rotation.x = -Math.PI / 2;
      waterMesh.position.y = 0.05;
      scene.add(waterMesh);
    });
  }

  // 7. Parking Bays with Low-Poly Cars (Screenshot 12)
  if (parking_lots) {
    const carColors = [0xffffff, 0xd1d5db, 0x1f2937, 0xef4444, 0x3b82f6];
    const carBodyGeo = new THREE.BoxGeometry(4.2, 1.5, 1.9);
    const carRoofGeo = new THREE.BoxGeometry(2.3, 1.1, 1.8);

    parking_lots.forEach(lot => {
      // Asphalt lot
      const lotGeo = new THREE.PlaneGeometry(lot.width, lot.length);
      const lotMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
      const lotMesh = new THREE.Mesh(lotGeo, lotMat);
      lotMesh.rotation.x = -Math.PI / 2;
      lotMesh.position.set(lot.x, 0.03, -lot.y);
      scene.add(lotMesh);

      // Procedural parked cars in rows matching the screenshot
      for (let bay = 0; bay < lot.bays; bay++) {
        const carX = lot.x - lot.width / 2 + 10 + bay * 13;
        for (let row = 0; row < 12; row++) {
          if (Math.random() > 0.18) { // 82% parking occupancy
            const carZ = lot.y - lot.length / 2 + 12 + row * 10;
            const carGroup = new THREE.Group();
            const col = carColors[Math.floor(Math.random() * carColors.length)];
            const carMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.3 });

            const body = new THREE.Mesh(carBodyGeo, carMat);
            body.position.y = 0.75;
            body.castShadow = true;
            carGroup.add(body);

            const roof = new THREE.Mesh(carRoofGeo, carMat);
            roof.position.set(-0.2, 1.7, 0);
            roof.castShadow = true;
            carGroup.add(roof);

            carGroup.position.set(carX, 0, carZ);
            scene.add(carGroup);
          }
        }
      }
    });
  }
}

// --------------------------------------------------------------------------
// Instanced Low-Poly Trees (High-Performance 2,500+ trees)
// --------------------------------------------------------------------------
function buildTrees() {
  const treeList = state.data.trees || [];
  if (treeList.length === 0) return;

  // Separate trunk and crown meshes keep trees readable at campus scale.
  const foliageGeo = new THREE.ConeGeometry(3.3, 8.5, 7);
  foliageGeo.translate(0, 5.2, 0);

  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 4);
  trunkGeo.translate(0, 0.75, 0);

  // Instanced mesh for foliage
  const foliageMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
  treeInstancedMesh = new THREE.InstancedMesh(foliageGeo, foliageMat, treeList.length);
  treeInstancedMesh.castShadow = true;
  treeInstancedMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const treeColors = [0x15803d, 0x166534, 0x22c55e, 0x14532d];
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x70513d });
  treeTrunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, treeList.length);
  treeTrunkMesh.castShadow = true;

  treeList.forEach((t, i) => {
    const [tx, tz, h] = t;
    const s = Math.max(1.25, (h / 4.5) * 1.45);
    dummy.position.set(tx, 0, -tz);
    dummy.scale.set(s, s, s);
    dummy.rotation.y = (tx * tz) % (Math.PI * 2);
    dummy.updateMatrix();

    treeInstancedMesh.setMatrixAt(i, dummy.matrix);
    treeTrunkMesh.setMatrixAt(i, dummy.matrix);
    const col = new THREE.Color(treeColors[i % treeColors.length]);
    treeInstancedMesh.setColorAt(i, col);
  });

  treeInstancedMesh.instanceMatrix.needsUpdate = true;
  if (treeInstancedMesh.instanceColor) treeInstancedMesh.instanceColor.needsUpdate = true;
  treeTrunkMesh.instanceMatrix.needsUpdate = true;
  scene.add(treeTrunkMesh, treeInstancedMesh);
}

// --------------------------------------------------------------------------
// 3D Landmark Pins
// --------------------------------------------------------------------------
function buildLandmarkPins() {
  state.data.landmarks.forEach(lm => {
    const [mx, my] = latlonToMeters(lm.lat, lm.lon);
    const mz = -my;
    
    // Pin Marker: Floating glowing jewel
    const pinGeo = new THREE.OctahedronGeometry(3.5, 0);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: false });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.set(mx, lm.height + 14, mz);
    
    // Thin stalk line to the ground/roof
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(mx, lm.height, mz),
      new THREE.Vector3(mx, lm.height + 12, mz)
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const stalk = new THREE.Line(lineGeo, lineMat);

    pinMesh.userData = { isPin: true, landmark: lm };
    landmarkPinsGroup.add(pinMesh);
    landmarkPinsGroup.add(stalk);
  });
}

function latlonToMeters(lat, lon) {
  const CENTER_LAT = state.data.metadata.center[0];
  const CENTER_LON = state.data.metadata.center[1];
  const y = (lat - CENTER_LAT) * 111139.0;
  const x = (lon - CENTER_LON) * 111139.0 * Math.cos(CENTER_LAT * Math.PI / 180.0);
  return [x, y];
}

// --------------------------------------------------------------------------
// Satellite Basemap Layer (Procedural Ground Truth Projection)
// --------------------------------------------------------------------------
function setupSatelliteBasemap() {
  const loader = new THREE.TextureLoader();
  loader.load('satellite_ortho.jpg', texture => {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    // 1080 x 1800 px at 1.4778 m/px
    const width_m = 1596.0;
    const height_m = 2660.0;
    const satGeo = new THREE.PlaneGeometry(width_m, height_m);
    const satMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.92
    });

    satelliteMesh = new THREE.Mesh(satGeo, satMat);
    satelliteMesh.rotation.x = -Math.PI / 2;
    // Calibrated georeferenced center matching surveyed pitch and core
    satelliteMesh.position.set(-28.9, 0.02, 415.4);
    satelliteMesh.visible = false;
    scene.add(satelliteMesh);
  });
}

// --------------------------------------------------------------------------
// Interactivity: Hover, Click, Raycasting, Camera Transitions
// --------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function setupEvents() {
  const dom = renderer.domElement;
  dom.addEventListener('mousemove', onMouseMove);
  dom.addEventListener('click', onClick);

  // Walk controls keydown/keyup
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  dom.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  if (state.viewMode === 'walk' && state.walkControls.isMouseDown) {
    const deltaX = e.clientX - state.walkControls.prevMouseX;
    const deltaY = e.clientY - state.walkControls.prevMouseY;
    state.walkControls.prevMouseX = e.clientX;
    state.walkControls.prevMouseY = e.clientY;

    state.walkControls.yaw -= deltaX * 0.003;
    state.walkControls.pitch -= deltaY * 0.003;
    state.walkControls.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, state.walkControls.pitch));
    return;
  }

  // Hover detection for buildings
  if (state.viewMode !== 'walk') {
    raycaster.setFromCamera(mouse, currentCamera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    let hitBuilding = null;
    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData.isBuilding) {
        hitBuilding = hit.object;
        break;
      }
    }

    const tooltip = document.getElementById('hover-tooltip');
    if (hitBuilding) {
      if (state.hoveredMesh !== hitBuilding) {
        resetHoverMesh();
        state.hoveredMesh = hitBuilding;
        if (state.hoveredMesh !== state.selectedBuilding) {
          state.hoveredMesh.material.color.set(PALETTE.hoverHighlight);
        }
      }

      // Show tooltip
      const bData = hitBuilding.userData.data;
      tooltip.style.left = `${e.clientX}px`;
      tooltip.style.top = `${e.clientY - 12}px`;
      document.getElementById('tooltip-name').textContent = bData.name;
      document.getElementById('tooltip-sub').textContent = `${bData.category} • ${bData.height}m (${bData.levels} Floors)`;
      tooltip.classList.remove('hidden');
      document.body.style.cursor = 'pointer';
    } else {
      resetHoverMesh();
      tooltip.classList.add('hidden');
      document.body.style.cursor = 'default';
    }
  }
}

function resetHoverMesh() {
  if (state.hoveredMesh) {
    if (state.hoveredMesh !== state.selectedBuilding) {
      if (state.layers.zoning) {
        applyZoningColor(state.hoveredMesh);
      } else {
        state.hoveredMesh.material.color.copy(state.hoveredMesh.userData.originalColor);
      }
    }
    state.hoveredMesh = null;
  }
}

function onClick(e) {
  // Distance Measurement Tool active?
  if (state.isMeasuring) {
    handleMeasurementClick(e);
    return;
  }

  raycaster.setFromCamera(mouse, currentCamera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  for (const hit of intersects) {
    if (hit.object.userData && hit.object.userData.isBuilding) {
      selectBuilding(hit.object);
      return;
    }
    if (hit.object.userData && hit.object.userData.isPin) {
      const lm = hit.object.userData.landmark;
      flyToPosition(hit.object.position.x, hit.object.position.z, 140);
      return;
    }
  }
}

function selectBuilding(mesh) {
  // Deselect previous
  if (state.selectedBuilding) {
    if (state.layers.zoning) {
      applyZoningColor(state.selectedBuilding);
    } else {
      state.selectedBuilding.material.color.copy(state.selectedBuilding.userData.originalColor);
    }
  }

  state.selectedBuilding = mesh;
  mesh.material.color.set(PALETTE.selectedHighlight);

  const b = mesh.userData.data;
  showInspector(b);
  flyToPosition(b.center[0], -b.center[1], Math.max(80, b.height * 2.8));
}

function showInspector(b) {
  const panel = document.getElementById('inspector-panel');
  document.getElementById('insp-title').textContent = b.name;
  document.getElementById('insp-desc').textContent = b.description;
  document.getElementById('insp-category').textContent = b.category;
  document.getElementById('insp-block').textContent = b.block ? `Block ${b.block}` : 'LPU Core';
  document.getElementById('insp-height').textContent = `${b.height} m`;
  document.getElementById('insp-levels').textContent = `${b.levels} Levels`;
  document.getElementById('insp-area').textContent = `${Math.round(b.area).toLocaleString()} m²`;
  document.getElementById('insp-coords').textContent = `${(31.2535 + b.center[1] / 111139).toFixed(4)}° N`;

  const photoWrap = document.getElementById('insp-photo-wrapper');
  const photoImg = document.getElementById('insp-photo');
  if (photoWrap && photoImg) {
    if (b.photo) {
      photoImg.src = b.photo;
      photoWrap.classList.remove('hidden');
    } else {
      photoWrap.classList.add('hidden');
    }
  }

  panel.classList.remove('hidden');
}

function flyToPosition(targetX, targetZ, distance = 160) {
  if (state.viewMode === 'walk') return;

  const targetVec = new THREE.Vector3(targetX, 0, targetZ);
  const endCamPos = new THREE.Vector3(
    targetX + distance * 0.85,
    distance * 0.95,
    targetZ + distance * 1.1
  );

  new TWEEN.Tween(controls.target)
    .to(targetVec, 1200)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  new TWEEN.Tween(perspectiveCamera.position)
    .to(endCamPos, 1200)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
}

// --------------------------------------------------------------------------
// Measurement Tool
// --------------------------------------------------------------------------
function handleMeasurementClick(e) {
  raycaster.setFromCamera(mouse, currentCamera);
  const intersects = raycaster.intersectObjects([groundPlane, ...state.buildingMeshes.values()]);

  if (intersects.length > 0) {
    const pt = intersects[0].point;
    state.measurePoints.push(pt);

    // Create dot marker
    const dotGeo = new THREE.SphereGeometry(1.6, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(pt);
    measureMarkersGroup.add(dot);

    if (state.measurePoints.length === 2) {
      const p1 = state.measurePoints[0];
      const p2 = state.measurePoints[1];
      const dist = p1.distanceTo(p2);

      // Draw line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0xf59e0b,
        dashSize: 3,
        gapSize: 1.5,
        linewidth: 2
      });
      state.measureLine = new THREE.Line(lineGeo, lineMat);
      state.measureLine.computeLineDistances();
      measureMarkersGroup.add(state.measureLine);

      // Display result
      document.getElementById('measure-val').textContent = `${dist.toFixed(1)} meters (${(dist * 3.28084).toFixed(0)} ft)`;
      document.getElementById('measure-result').classList.remove('hidden');
      document.getElementById('btn-measure-clear').classList.remove('hidden');
    } else if (state.measurePoints.length > 2) {
      clearMeasurement();
      state.measurePoints.push(pt);
      measureMarkersGroup.add(dot);
    }
  }
}

function clearMeasurement() {
  state.measurePoints = [];
  while (measureMarkersGroup.children.length > 0) {
    measureMarkersGroup.remove(measureMarkersGroup.children[0]);
  }
  document.getElementById('measure-result').classList.add('hidden');
  document.getElementById('btn-measure-clear').classList.add('hidden');
}

// --------------------------------------------------------------------------
// UI Controls & Setup
// --------------------------------------------------------------------------
function setupUI() {
  // 1. Camera View Preset Buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchViewMode(btn.dataset.view);
    });
  });

  // 2. Sector Quick Jump
  document.querySelectorAll('.sector-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      jumpToSector(chip.dataset.target);
    });
  });

  // 3. Layer Toggles
  document.getElementById('layer-satellite').addEventListener('change', e => {
    state.layers.satellite = e.target.checked;
    if (satelliteMesh) satelliteMesh.visible = e.target.checked;
    groundPlane.visible = !e.target.checked;
  });

  document.getElementById('layer-zoning').addEventListener('change', e => {
    state.layers.zoning = e.target.checked;
    updateBuildingColors();
  });

  document.getElementById('layer-trees').addEventListener('change', e => {
    state.layers.trees = e.target.checked;
    if (treeInstancedMesh) treeInstancedMesh.visible = e.target.checked;
  });

  document.getElementById('layer-solar').addEventListener('change', e => {
    state.layers.solar = e.target.checked;
    solarGroup.visible = e.target.checked;
  });

  document.getElementById('layer-labels').addEventListener('change', e => {
    state.layers.labels = e.target.checked;
    landmarkPinsGroup.visible = e.target.checked;
  });

  // 4. Time of Day Slider
  const timeSlider = document.getElementById('time-slider');
  const timeLabel = document.getElementById('time-label');
  timeSlider.addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    const hrs = Math.floor(val);
    const mins = (val % 1) * 60 === 0 ? '00' : '30';
    timeLabel.textContent = `${hrs.toString().padStart(2, '0')}:${mins}`;
    setTimeOfDay(val);
  });

  // 5. Inspector Close
  document.getElementById('btn-close-insp').addEventListener('click', () => {
    document.getElementById('inspector-panel').classList.add('hidden');
    if (state.selectedBuilding) {
      if (state.layers.zoning) {
        applyZoningColor(state.selectedBuilding);
      } else {
        state.selectedBuilding.material.color.copy(state.selectedBuilding.userData.originalColor);
      }
      state.selectedBuilding = null;
    }
  });

  // 6. Focus Button in Inspector
  document.getElementById('btn-focus-bldg').addEventListener('click', () => {
    if (state.selectedBuilding) {
      const b = state.selectedBuilding.userData.data;
      flyToPosition(b.center[0], b.center[1], Math.max(70, b.height * 2.2));
    }
  });

  // 7. Measurement Bar
  const measureBtn = document.getElementById('btn-measure-dist');
  measureBtn.addEventListener('click', () => {
    state.isMeasuring = !state.isMeasuring;
    measureBtn.classList.toggle('active', state.isMeasuring);
    if (!state.isMeasuring) {
      clearMeasurement();
    }
  });
  document.getElementById('btn-measure-clear').addEventListener('click', clearMeasurement);

  // 8. Compass reset
  document.getElementById('compass-widget').addEventListener('click', () => {
    flyToPosition(0, 0, 800);
  });

  // 9. Fullscreen
  document.getElementById('btn-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  // 10. Search Input & Auto-filter
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-dropdown');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      document.getElementById('search-results').classList.add('hidden');
      return;
    }
    filterSearchResults(q);
  });
}

function switchViewMode(mode) {
  state.viewMode = mode;
  state.isTouring = (mode === 'tour');

  const walkHud = document.getElementById('walk-hud');

  if (mode === 'isometric') {
    walkHud.classList.add('hidden');
    controls.enabled = true;
    currentCamera = perspectiveCamera;
    flyToPosition(0, 0, 800);
  } else if (mode === 'topdown') {
    walkHud.classList.add('hidden');
    controls.enabled = true;
    controls.target.set(0, 0, 0);
    currentCamera = orthoCamera;
    orthoCamera.position.set(0, 950, 0);
    orthoCamera.lookAt(0, 0, 0);
  } else if (mode === 'walk') {
    walkHud.classList.remove('hidden');
    controls.enabled = false;
    currentCamera = perspectiveCamera;
    // Position at Main Gate Entrance boulevard at eye level (1.75m)
    perspectiveCamera.position.set(160, 2.2, -480);
    state.walkControls.yaw = 0; // Face south into campus
    state.walkControls.pitch = 0;
  } else if (mode === 'tour') {
    walkHud.classList.add('hidden');
    controls.enabled = false;
    currentCamera = perspectiveCamera;
  }
}

function jumpToSector(sector) {
  const coords = {
    maingate: [160, -380, 280],
    block32: [140, -145, 180],
    amphitheater: [65, -33, 140],
    cricket: [-199, 652, 260],
    sportsarena: [160, -310, 240],
    engineering: [-50, -40, 240],
    hostel: [220, -380, 320]
  };

  const target = coords[sector] || [0, 0, 800];
  flyToPosition(target[0], target[1], target[2]);
}

function updateBuildingColors() {
  state.buildingMeshes.forEach(mesh => {
    if (mesh === state.selectedBuilding) return;
    if (state.layers.zoning) {
      applyZoningColor(mesh);
    } else {
      mesh.material.color.copy(mesh.userData.originalColor);
    }
  });
}

function applyZoningColor(mesh) {
  const cat = mesh.userData.data.category;
  const col = ZONING_COLORS[cat] || 0x94a3b8;
  mesh.material.color.set(col);
}

function setTimeOfDay(val) {
  state.timeOfDay = val;
  // Map 6:00 to 22:00
  const progress = (val - 6) / 16; // 0 (dawn) to 1 (night)
  const angle = progress * Math.PI;

  const sunX = Math.cos(angle) * 700;
  const sunY = Math.max(10, Math.sin(angle) * 700);
  const sunZ = -350 + Math.sin(angle) * 100;
  dirLight.position.set(sunX, sunY, sunZ);

  if (val >= 18 || val <= 7) {
    // Sunset / Dusk / Night
    scene.background.set(0x0f172a);
    scene.fog.color.set(0x0f172a);
    hemiLight.color.set(0x38bdf8);
    hemiLight.groundColor.set(0x0f172a);
    hemiLight.intensity = 0.35;
    dirLight.intensity = Math.max(0.1, Math.sin(angle) * 1.3);
    dirLight.color.set(0xf59e0b);
  } else {
    // Bright Daylight
    scene.background.set(0xdbeafe);
    scene.fog.color.set(0xdbeafe);
    hemiLight.color.set(0xffffff);
    hemiLight.groundColor.set(0x94a3b8);
    hemiLight.intensity = 0.75;
    dirLight.intensity = 1.3;
    dirLight.color.set(0xfffaed);
  }
}

// --------------------------------------------------------------------------
// Search Engine
// --------------------------------------------------------------------------
function populateSearchDropdown() {
  const container = document.getElementById('search-results');
  container.innerHTML = '';
}

function filterSearchResults(query) {
  const container = document.getElementById('search-results');
  container.innerHTML = '';

  const matches = state.buildings.filter(b => 
    b.name.toLowerCase().includes(query) || 
    (b.block && b.block.toLowerCase().includes(query)) ||
    b.category.toLowerCase().includes(query)
  ).slice(0, 8);

  if (matches.length === 0) {
    container.innerHTML = '<div class="search-item" style="color:#94a3b8">No matching campus buildings found</div>';
    container.classList.remove('hidden');
    return;
  }

  matches.forEach(b => {
    const item = document.createElement('div');
    item.className = 'search-item';
    item.innerHTML = `
      <span class="search-item-title">${b.name}</span>
      <span class="search-item-sub">${b.block ? 'Block ' + b.block : b.category}</span>
    `;
    item.addEventListener('click', () => {
      const mesh = state.buildingMeshes.get(b.id);
      if (mesh) selectBuilding(mesh);
      container.classList.add('hidden');
      document.getElementById('search-input').value = b.name;
    });
    container.appendChild(item);
  });

  container.classList.remove('hidden');
}

// --------------------------------------------------------------------------
// First-Person Walk Mode Logic
// --------------------------------------------------------------------------
function onKeyDown(e) {
  if (state.viewMode !== 'walk') return;
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': state.walkControls.forward = true; break;
    case 'KeyS': case 'ArrowDown': state.walkControls.backward = true; break;
    case 'KeyA': case 'ArrowLeft': state.walkControls.left = true; break;
    case 'KeyD': case 'ArrowRight': state.walkControls.right = true; break;
    case 'ShiftLeft': case 'ShiftRight': state.walkControls.sprint = true; break;
    case 'Escape': switchViewMode('isometric'); break;
  }
}

function onKeyUp(e) {
  if (state.viewMode !== 'walk') return;
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': state.walkControls.forward = false; break;
    case 'KeyS': case 'ArrowDown': state.walkControls.backward = false; break;
    case 'KeyA': case 'ArrowLeft': state.walkControls.left = false; break;
    case 'KeyD': case 'ArrowRight': state.walkControls.right = false; break;
    case 'ShiftLeft': case 'ShiftRight': state.walkControls.sprint = false; break;
  }
}

function onMouseDown(e) {
  if (state.viewMode === 'walk') {
    state.walkControls.isMouseDown = true;
    state.walkControls.prevMouseX = e.clientX;
    state.walkControls.prevMouseY = e.clientY;
  }
}

function onMouseUp() {
  state.walkControls.isMouseDown = false;
}

function updateWalkMovement(delta) {
  const speed = (state.walkControls.sprint ? 38.0 : 18.0) * delta;
  const forwardX = Math.sin(state.walkControls.yaw);
  const forwardZ = Math.cos(state.walkControls.yaw);
  const rightX = Math.cos(state.walkControls.yaw);
  const rightZ = -Math.sin(state.walkControls.yaw);

  if (state.walkControls.forward) {
    perspectiveCamera.position.x += forwardX * speed;
    perspectiveCamera.position.z += forwardZ * speed;
  }
  if (state.walkControls.backward) {
    perspectiveCamera.position.x -= forwardX * speed;
    perspectiveCamera.position.z -= forwardZ * speed;
  }
  if (state.walkControls.left) {
    perspectiveCamera.position.x -= rightX * speed;
    perspectiveCamera.position.z -= rightZ * speed;
  }
  if (state.walkControls.right) {
    perspectiveCamera.position.x += rightX * speed;
    perspectiveCamera.position.z += rightZ * speed;
  }

  perspectiveCamera.position.y = 2.2; // Keep eye level constant

  // Compute camera look direction from pitch and yaw
  const dir = new THREE.Vector3(
    Math.sin(state.walkControls.yaw) * Math.cos(state.walkControls.pitch),
    Math.sin(state.walkControls.pitch),
    Math.cos(state.walkControls.yaw) * Math.cos(state.walkControls.pitch)
  );
  perspectiveCamera.lookAt(perspectiveCamera.position.clone().add(dir));
}

// --------------------------------------------------------------------------
// Animation Loop & Window Resize
// --------------------------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  TWEEN.update();

  if (state.viewMode === 'walk') {
    updateWalkMovement(delta);
  } else if (state.isTouring) {
    // Cinematic Orbit Tour
    state.tourAngle += delta * 0.08;
    const r = 720;
    perspectiveCamera.position.x = Math.cos(state.tourAngle) * r;
    perspectiveCamera.position.z = Math.sin(state.tourAngle) * r;
    perspectiveCamera.position.y = 380;
    controls.target.set(0, 0, 0);
    controls.update();
  } else {
    controls.update();
  }

  // Update Compass needle rotation based on camera azimuthal angle
  if (state.viewMode !== 'walk') {
    const camAngle = Math.atan2(perspectiveCamera.position.x, perspectiveCamera.position.z);
    const needle = document.getElementById('compass-needle');
    if (needle) needle.style.transform = `rotate(${-camAngle}rad)`;
  }

  // Gentle floating animation on 3D landmark pins
  const time = clock.getElapsedTime();
  landmarkPinsGroup.children.forEach(child => {
    if (child.userData && child.userData.isPin) {
      child.rotation.y = time * 1.5;
    }
  });

  renderer.render(scene, currentCamera);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  perspectiveCamera.aspect = width / height;
  perspectiveCamera.updateProjectionMatrix();

  const aspect = width / height;
  const d = 550;
  orthoCamera.left = -d * aspect;
  orthoCamera.right = d * aspect;
  orthoCamera.top = d;
  orthoCamera.bottom = -d;
  orthoCamera.updateProjectionMatrix();

  renderer.setSize(width, height);
}
