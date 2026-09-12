import json
import math

CENTER_LAT = 31.2535
CENTER_LON = 75.7025

def latlon_to_meters(lat, lon):
    lat_rad = math.radians(lat)
    center_lat_rad = math.radians(CENTER_LAT)
    y = (lat - CENTER_LAT) * 111139.0
    x = (lon - CENTER_LON) * 111139.0 * math.cos(center_lat_rad)
    return round(x, 2), round(y, 2)

def main():
    print("Loading OSM raw data...")
    with open("lpu_osm_raw.json", "r", encoding="utf-8") as f:
        osm = json.load(f)

    elements = osm.get("elements", [])
    nodes = {}
    for el in elements:
        if el["type"] == "node":
            nodes[el["id"]] = (el["lat"], el["lon"])

    ways = [el for el in elements if el["type"] == "way"]

    buildings = []
    highways = []
    leisure = []
    landuse = []
    water_bodies = []

    # 21 Ground-Truth Landmarks surveyed from the mobile map screenshots
    known_landmarks = [
        {
            "name": "Division of Admissions & Career Services (Block 32)",
            "block": "32",
            "lat": 31.2548, "lon": 75.7038,
            "height": 38,
            "category": "Academic / Admin",
            "photo": "lpu/Screenshot_20260911-234326.png",
            "desc": "Iconic administrative hub, admissions concourse, career & placements center, and grand atrium."
        },
        {
            "name": "Block 34 - Computer Science & Engineering",
            "block": "34",
            "lat": 31.2538, "lon": 75.7008,
            "height": 28,
            "category": "Academic",
            "photo": "lpu/Screenshot_20260911-234412.png",
            "desc": "Computing headquarters housing Apple iOS Academy, NVIDIA AI Supercomputing Lab, and CS research bays."
        },
        {
            "name": "UniMall & School of Hotel Management (Block 15)",
            "block": "UniMall",
            "lat": 31.2556, "lon": 75.7050,
            "height": 24,
            "category": "Commercial & Dining",
            "photo": "lpu/Screenshot_20260911-234334.png",
            "desc": "5-floor student shopping mall, multi-cuisine food courts, retail shops, banks, and massive rooftop solar PV farm."
        },
        {
            "name": "Unipolis Covered Grand Amphitheatre & Plaza",
            "block": "Unipolis",
            "lat": 31.2550, "lon": 75.7047,
            "height": 18,
            "category": "Plaza & Culture",
            "photo": "lpu/Screenshot_20260911-234326.png",
            "desc": "Asia's largest 10,000-seat tensile-canopy amphitheatre hosting global youth festivals and convocations."
        },
        {
            "name": "Block 14 & Division of Student Welfare (DSW)",
            "block": "14",
            "lat": 31.2545, "lon": 75.7055,
            "height": 22,
            "category": "Academic / Admin",
            "photo": "lpu/Screenshot_20260911-234326.png",
            "desc": "Student Welfare headquarters, cultural clubs, student council, and Mittal School of Business."
        },
        {
            "name": "Block 26 - Biosciences & Bioengineering",
            "block": "26",
            "lat": 31.2541, "lon": 75.7046,
            "height": 26,
            "category": "Academic",
            "photo": "lpu/Screenshot_20260911-234412.png",
            "desc": "School of Bioengineering & Biosciences with genomics laboratories and rooftop solar array."
        },
        {
            "name": "Block 36 - Electronics & Electrical Engineering",
            "block": "36",
            "lat": 31.2530, "lon": 75.7038,
            "height": 28,
            "category": "Academic",
            "photo": "lpu/Screenshot_20260911-234412.png",
            "desc": "Robotics innovation labs, embedded systems workshops, and automation testbeds."
        },
        {
            "name": "Lovely Institute of Technology (LIT)",
            "block": "LIT",
            "lat": 31.2565, "lon": 75.7020,
            "height": 26,
            "category": "Academic",
            "photo": "lpu/Screenshot_20260911-234246.png",
            "desc": "Courtyard engineering complex with high-tech lecture theatres and smart classrooms."
        },
        {
            "name": "Lovely Institute of International Studies (LIIS)",
            "block": "LIIS",
            "lat": 31.2558, "lon": 75.7018,
            "height": 24,
            "category": "Academic",
            "photo": "lpu/Screenshot_20260911-234246.png",
            "desc": "International relations office, foreign exchange student programs, and global conference halls."
        },
        {
            "name": "Shri Baldev Raj Mittal Hospital & Health Centre",
            "block": "Hospital",
            "lat": 31.2552, "lon": 75.7008,
            "height": 18,
            "category": "Healthcare",
            "photo": "lpu/Screenshot_20260911-234246.png",
            "desc": "24/7 multispecialty university hospital, emergency casualty ward, pharmacy, and ICU ambulance service."
        },
        {
            "name": "Lovely School of Architecture & Design",
            "block": "Architecture",
            "lat": 31.2542, "lon": 75.7012,
            "height": 22,
            "category": "Academic",
            "photo": "lpu/Screenshot_20260911-234246.png",
            "desc": "Architectural studios, model-making workshops, digital drafting labs, and exhibition hall."
        },
        {
            "name": "Product & Industrial Design Block",
            "block": "Industrial",
            "lat": 31.2532, "lon": 75.7008,
            "height": 16,
            "category": "Labs & Workshops",
            "photo": "lpu/Screenshot_20260911-234246.png",
            "desc": "Heavy machinery fabrication, rapid prototyping facility, and solar research station."
        },
        {
            "name": "Block 47 - Indoor Mega Sports Complex & Gymnasium",
            "block": "47",
            "lat": 31.2563, "lon": 75.7047,
            "height": 22,
            "category": "Sports",
            "photo": "lpu/Screenshot_20260911-234447.png",
            "desc": "Olympic-grade indoor sports arena with indoor badminton, basketball, gymnastics, and modern gym."
        },
        {
            "name": "LPU Cricket Stadium & Pavilion",
            "block": "Stadium",
            "lat": 31.2476, "lon": 75.7004,
            "height": 16,
            "category": "Sports",
            "photo": "lpu/Screenshot_20260911-234514.png",
            "desc": "Championship circular cricket stadium with turf wicket and 14 tiered grandstand canopies."
        },
        {
            "name": "Boys Residential City (BH-1 to BH-8)",
            "block": "BH-Complex",
            "lat": 31.2568, "lon": 75.7050,
            "height": 36,
            "category": "Residential",
            "photo": "lpu/Screenshot_20260911-234514.png",
            "desc": "High-rise residential hostel towers with student mess, study lounges, and sports grounds."
        },
        {
            "name": "Girls Residential City (GH-Complex)",
            "block": "GH-Complex",
            "lat": 31.2519, "lon": 75.7047,
            "height": 34,
            "category": "Residential",
            "photo": "lpu/Screenshot_20260911-234447.png",
            "desc": "Dedicated secure women's residential halls with central landscaped gardens, reading rooms, and gym."
        },
        {
            "name": "Main Entrance Gate 1 (NH-44 / GT Road)",
            "block": "Gate 1",
            "lat": 31.2582, "lon": 75.7032,
            "height": 12,
            "category": "Civic / Gate",
            "photo": "lpu/Screenshot_20260911-234208.png",
            "desc": "Grand entrance gates connecting to National Highway 44, leading into the 4-lane palm boulevard."
        },
        {
            "name": "Late Mrs. Mittal Samadhi Memorial Oval",
            "block": "Memorial",
            "lat": 31.2562, "lon": 75.7042,
            "height": 4,
            "category": "Memorial & Park",
            "photo": "lpu/Screenshot_20260911-234157.png",
            "desc": "Oval landscaped memorial gardens with central monument, palm avenues, and reflecting pool."
        },
        {
            "name": "Central Stepped Amphitheater & Plaza",
            "block": "Plaza",
            "lat": 31.2538, "lon": 75.7032,
            "height": 6,
            "category": "Plaza & Culture",
            "photo": "lpu/Screenshot_20260911-234412.png",
            "desc": "Tiered open-air grass amphitheater connecting Block 26 and Block 36."
        },
        {
            "name": "Blocks 55 & 56 - School of Mechanical Engineering",
            "block": "55/56",
            "lat": 31.2551, "lon": 75.6990,
            "height": 24,
            "category": "Academic",
            "photo": "lpu/Screenshot_20260911-234246.png",
            "desc": "Automotive testbeds, wind tunnel laboratory, and Formula Student racecar fabrication bay."
        },
        {
            "name": "Blocks 57 & 58 - Polytechnic & Student Project Labs",
            "block": "57/58",
            "lat": 31.2555, "lon": 75.6985,
            "height": 20,
            "category": "Academic",
            "photo": "lpu/Screenshot_20260911-234246.png",
            "desc": "Crescent-shaped polytechnic building with engineering maker spaces and project workshops."
        }
    ]

    for w in ways:
        tags = w.get("tags", {})
        way_nodes = [nodes[nid] for nid in w.get("nodes", []) if nid in nodes]
        if len(way_nodes) < 2:
            continue

        coords_m = [latlon_to_meters(lat, lon) for lat, lon in way_nodes]

        if "building" in tags:
            avg_x = sum(pt[0] for pt in coords_m) / len(coords_m)
            avg_y = sum(pt[1] for pt in coords_m) / len(coords_m)
            avg_lat = sum(pt[0] for pt in way_nodes) / len(way_nodes)
            avg_lon = sum(pt[1] for pt in way_nodes) / len(way_nodes)

            name = tags.get("name", "")
            height = 16.0
            category = "Academic"
            desc = "Academic and departmental block."
            block_code = tags.get("ref", "")
            photo = ""

            if "building:levels" in tags:
                try:
                    levels = float(tags["building:levels"])
                    height = max(10.0, levels * 3.8)
                except ValueError:
                    pass

            matched = False
            for km in known_landmarks:
                dist = math.hypot((avg_lat - km["lat"]) * 111139, (avg_lon - km["lon"]) * 111139 * math.cos(math.radians(CENTER_LAT)))
                if dist < 65:
                    if not name or len(km["name"]) > len(name):
                        name = km["name"]
                    category = km["category"]
                    height = km["height"]
                    desc = km["desc"]
                    block_code = km["block"]
                    photo = km.get("photo", "")
                    matched = True
                    break

            if not matched:
                if avg_y > 250:
                    height = 22.0 if avg_x < 50 else 18.0
                    category = "Academic" if avg_x < 100 else "Civic & Services"
                elif avg_y > -150:
                    if avg_x > 150:
                        height = 36.0
                        category = "Residential"
                        name = name or "Student Residential Block"
                    elif avg_x < -100:
                        height = 20.0
                        category = "Labs & Workshops"
                    else:
                        height = 28.0
                        category = "Academic"
                elif avg_y > -500:
                    if avg_x > 100:
                        height = 40.0
                        category = "Residential"
                        name = name or "Hostel Tower"
                    elif avg_x < -50:
                        height = 14.0
                        category = "Sports Facility"
                    else:
                        height = 26.0
                        category = "Academic"
                else:
                    height = 22.0
                    category = "School of Agriculture & Research"

            if not name:
                if category == "Residential":
                    name = f"Residence Block {len(buildings) % 12 + 1}"
                elif category == "Academic":
                    name = f"Academic Block {len(buildings) % 45 + 1}"
                else:
                    name = f"Campus Facility {len(buildings) + 1}"

            min_x = min(pt[0] for pt in coords_m)
            max_x = max(pt[0] for pt in coords_m)
            min_y = min(pt[1] for pt in coords_m)
            max_y = max(pt[1] for pt in coords_m)
            w_m = round(max_x - min_x, 1)
            l_m = round(max_y - min_y, 1)
            area_m2 = round(w_m * l_m * 0.85, 1)

            has_solar = (area_m2 > 350 and height > 14) or "solar" in name.lower() or "unimall" in name.lower() or "bio" in name.lower()
            wall_color = "#f8fafc" if "Academic" in category else ("#fef3c7" if "Residential" in category else "#f1f5f9")

            buildings.append({
                "id": f"bldg_{w['id']}",
                "name": name,
                "block": block_code,
                "category": category,
                "description": desc,
                "photo": photo,
                "height": round(height, 1),
                "levels": max(1, int(round(height / 3.6))),
                "area": area_m2,
                "center": [round(avg_x, 1), round(avg_y, 1)],
                "polygon": coords_m,
                "has_solar": has_solar,
                "wall_color": wall_color
            })

        elif "highway" in tags:
            hw_type = tags.get("highway", "residential")
            is_primary = hw_type in ["primary", "trunk", "secondary", "tertiary"] or "grand" in tags.get("name", "").lower()
            is_pedestrian = hw_type in ["footway", "pedestrian", "path", "steps", "cycleway"]
            width = 16.0 if "trunk" in hw_type or "primary" in hw_type else (10.0 if not is_pedestrian else 4.0)

            highways.append({
                "id": f"hw_{w['id']}",
                "name": tags.get("name", "Campus Boulevard" if is_primary else ("Campus Walkway" if is_pedestrian else "Campus Ring Road")),
                "type": hw_type,
                "is_primary": is_primary,
                "is_pedestrian": is_pedestrian,
                "width": width,
                "path": coords_m
            })

        elif "leisure" in tags or "sport" in tags:
            leisure_type = tags.get("leisure", tags.get("sport", "pitch"))
            name = tags.get("name", "Sports Ground")
            leisure.append({
                "id": f"leisure_{w['id']}",
                "name": name,
                "type": leisure_type,
                "polygon": coords_m
            })

        elif "water" in tags or ("natural" in tags and tags.get("natural") == "water"):
            water_bodies.append({
                "id": f"water_{w['id']}",
                "name": tags.get("name", "Campus Water Body"),
                "polygon": coords_m
            })

        elif "landuse" in tags or "amenity" in tags:
            amenity_type = tags.get("amenity", tags.get("landuse", "grass"))
            landuse.append({
                "id": f"land_{w['id']}",
                "type": amenity_type,
                "name": tags.get("name", amenity_type.capitalize()),
                "polygon": coords_m
            })

    print(f"Extracted {len(buildings)} buildings, {len(highways)} roads, {len(leisure)} leisure zones.")

    # High-fidelity ground truth models surveyed from screenshots:
    # 1. Cricket Stadium (Screenshot 18: lat: 31.2476, lon: 75.7004)
    cricket_center = [-199.1, -651.8]
    cricket_radius = 68.0
    stadium_stands = []
    for i in range(14):
        angle = (i / 14.0) * math.pi * 1.8 + 0.2
        dist = cricket_radius + 9.0
        sx = cricket_center[0] + math.cos(angle) * dist
        sy = cricket_center[1] + math.sin(angle) * dist
        stadium_stands.append({
            "x": round(sx, 1),
            "y": round(sy, 1),
            "rotation": round(angle + math.pi/2, 3),
            "width": 14.0,
            "depth": 8.0,
            "height": 5.5
        })

    # 2. Central Stepped Amphitheater (Screenshot 14: lat: 31.2538, lon: 75.7032)
    amphitheater = {
        "center": [65.0, 33.3],
        "radius": 36.0,
        "tiers": 7,
        "start_angle": 1.9 * math.pi,
        "end_angle": 2.7 * math.pi
    }

    # 3. Late Mrs. Mittal Samadhi Memorial Oval (Screenshot 11: lat: 31.2562, lon: 75.7042)
    samadhi_oval = {
        "center": [160.0, 300.1],
        "radius_x": 26.0,
        "radius_y": 48.0,
        "inner_monument": [160.0, 305.0, 12.0, 16.0]
    }

    # 4. Outdoor Sports Hardcourts (Screenshot 19)
    sports_courts = [
        {"name": "Volleyball Court 1", "x": -140, "y": -420, "w": 18, "h": 9, "color": "#fb923c"},
        {"name": "Volleyball Court 2", "x": -118, "y": -420, "w": 18, "h": 9, "color": "#fb923c"},
        {"name": "Volleyball Court 3", "x": -96, "y": -420, "w": 18, "h": 9, "color": "#fb923c"},
        {"name": "Basketball Court 1", "x": -140, "y": -445, "w": 28, "h": 15, "color": "#38bdf8"},
        {"name": "Basketball Court 2", "x": -108, "y": -445, "w": 28, "h": 15, "color": "#38bdf8"},
        {"name": "Tennis Court 1", "x": -140, "y": -475, "w": 24, "h": 11, "color": "#4ade80"},
        {"name": "Tennis Court 2", "x": -112, "y": -475, "w": 24, "h": 11, "color": "#4ade80"}
    ]

    # 5. STP Clarifier Tanks (Screenshot 15)
    stp_tanks = [
        {"x": 235.0, "y": 65.0, "radius": 16.0, "height": 3.0},
        {"x": 275.0, "y": 62.0, "radius": 16.0, "height": 3.0}
    ]

    # 6. Main Parking Bays (Screenshot 12)
    parking_lots = [
        {"x": 240.0, "y": 380.0, "width": 85.0, "length": 140.0, "bays": 6}
    ]

    # 7. Water Bodies
    water_features = [
        {
            "name": "South University Lake & Retention Basin",
            "polygon": [
                [-120, -780], [-20, -770], [40, -830], [-10, -910], [-90, -890], [-130, -840]
            ]
        },
        {
            "name": "Samadhi Reflecting Pool",
            "polygon": [
                [154, 280], [166, 280], [166, 310], [154, 310]
            ]
        }
    ]

    # 8. Georeferenced Trees along Boulevards and Parks
    trees = []
    for y in range(220, 520, 14):
        trees.append([132.0, float(y), 4.5 + (y % 3)*0.5])
        trees.append([150.0, float(y), 4.5 + (y % 2)*0.5])
        trees.append([170.0, float(y), 4.5 + (y % 4)*0.5])
        trees.append([188.0, float(y), 4.5 + (y % 3)*0.5])

    for x in range(30, 120, 14):
        for y in range(260, 360, 15):
            trees.append([float(x), float(y), 4.0 + ((x + y) % 4)*0.6])

    for i in range(48):
        ang = (i / 48.0) * math.pi * 2.0
        tx = cricket_center[0] + math.cos(ang) * (cricket_radius + 22.0)
        ty = cricket_center[1] + math.sin(ang) * (cricket_radius + 22.0)
        trees.append([round(tx, 1), round(ty, 1), 5.0 + (i % 3)*0.7])

    for y in range(320, 440, 12):
        trees.append([195.0, float(y), 4.2])
        trees.append([285.0, float(y), 4.2])

    for x in range(120, 220, 15):
        for y in range(100, 170, 14):
            trees.append([float(x), float(y), 4.5 + ((x*y) % 3)*0.5])

    buildings.sort(key=lambda b: b["area"], reverse=True)

    campus_model = {
        "metadata": {
            "title": "Lovely Professional University (LPU) Architectural Masterplan",
            "center": [CENTER_LAT, CENTER_LON],
            "units": "meters",
            "building_count": len(buildings),
            "road_count": len(highways),
            "tree_count": len(trees),
            "bounds": {
                "min_x": -650, "max_x": 650,
                "min_y": -950, "max_y": 750
            }
        },
        "landmarks": known_landmarks,
        "buildings": buildings,
        "highways": highways,
        "leisure": leisure,
        "water_bodies": water_features,
        "cricket_stadium": {
            "center": cricket_center,
            "radius": cricket_radius,
            "stands": stadium_stands
        },
        "amphitheater": amphitheater,
        "samadhi_oval": samadhi_oval,
        "sports_courts": sports_courts,
        "stp_tanks": stp_tanks,
        "parking_lots": parking_lots,
        "trees": trees
    }

    with open("campus_data.json", "w", encoding="utf-8") as f:
        json.dump(campus_model, f, indent=2)

    print("Saved campus_data.json successfully with", len(buildings), "buildings and", len(known_landmarks), "landmarks!")

if __name__ == "__main__":
    main()
