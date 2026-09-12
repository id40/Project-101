-- Useful queries for testing the LPU database

-- 1. List all locations
SELECT name, type, block_code, model_object_id, confidence_level
FROM locations
WHERE is_active = TRUE
ORDER BY name;

-- 2. Search locations
SELECT name, type, short_description, model_object_id
FROM searchable_locations
WHERE name ILIKE '%library%'
   OR description ILIKE '%library%'
ORDER BY name;

-- 3. Find a 3D object ID
SELECT name, model_object_id
FROM locations
WHERE slug = 'block-14';

-- 4. Facilities for a location
SELECT location_name, facility_name
FROM location_facility_directory
WHERE location_name = 'Block 37'
ORDER BY facility_name;

-- 5. Vendors in a location
SELECT location_name, vendor_name, vendor_category, is_verified
FROM location_vendor_directory
WHERE location_name = 'UniMall / UniCentre'
ORDER BY vendor_name;

-- 6. All residences
SELECT name, description, confidence_level
FROM locations
WHERE type = 'residence'
ORDER BY name;

-- 7. Unverified information (useful for an admin panel)
SELECT name, source_type, confidence_level
FROM locations
WHERE is_verified = FALSE
ORDER BY confidence_level, name;

-- 8. Route nodes for a location (after you add route data)
SELECT *
FROM route_nodes
WHERE location_id = (SELECT id FROM locations WHERE slug='block-14');

-- 9. Connected route edges for a node
SELECT *
FROM route_edges
WHERE from_node_id = 'PUT-NODE-UUID-HERE'
   OR to_node_id = 'PUT-NODE-UUID-HERE';

-- 10. Chatbot documents linked to a place
SELECT l.name, d.title, d.content
FROM chatbot_documents d
JOIN locations l ON l.id = d.location_id
WHERE l.slug = 'block-37';
