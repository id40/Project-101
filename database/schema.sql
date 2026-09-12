-- LPU 3D Campus Navigator
-- Local PostgreSQL schema (Supabase can be connected later)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP VIEW IF EXISTS location_vendor_directory;
DROP VIEW IF EXISTS location_facility_directory;
DROP VIEW IF EXISTS searchable_locations;
DROP VIEW IF EXISTS location_directory;

DROP TABLE IF EXISTS chatbot_messages CASCADE;
DROP TABLE IF EXISTS chatbot_sessions CASCADE;
DROP TABLE IF EXISTS chatbot_documents CASCADE;
DROP TABLE IF EXISTS campus_notes CASCADE;
DROP TABLE IF EXISTS route_edges CASCADE;
DROP TABLE IF EXISTS route_nodes CASCADE;
DROP TABLE IF EXISTS location_facilities CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    block_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    map_x DOUBLE PRECISION,
    map_y DOUBLE PRECISION,
    map_z DOUBLE PRECISION,
    model_object_id TEXT UNIQUE,
    image_url TEXT,
    opening_hours JSONB,
    source_type TEXT NOT NULL DEFAULT 'user_supplied',
    source_details TEXT,
    confidence_level TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    phone TEXT,
    image_url TEXT,
    opening_hours JSONB,
    source_type TEXT NOT NULL DEFAULT 'user_supplied',
    source_details TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT
);

CREATE TABLE location_facilities (
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    PRIMARY KEY (location_id, facility_id)
);

CREATE TABLE route_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL,
    z DOUBLE PRECISION NOT NULL,
    node_type TEXT NOT NULL
);

CREATE TABLE route_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_node_id UUID NOT NULL REFERENCES route_nodes(id) ON DELETE CASCADE,
    to_node_id UUID NOT NULL REFERENCES route_nodes(id) ON DELETE CASCADE,
    distance_meters DOUBLE PRECISION NOT NULL CHECK (distance_meters >= 0),
    is_walkable BOOLEAN NOT NULL DEFAULT TRUE,
    accessibility TEXT,
    travel_time_seconds INTEGER CHECK (travel_time_seconds IS NULL OR travel_time_seconds >= 0)
);

CREATE TABLE chatbot_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_url TEXT,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chatbot_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chatbot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chatbot_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campus_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_block_code ON locations(block_code);
CREATE INDEX idx_locations_model_object_id ON locations(model_object_id);
CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_location_id ON vendors(location_id);
CREATE INDEX idx_route_nodes_location_id ON route_nodes(location_id);
CREATE INDEX idx_route_edges_from_node_id ON route_edges(from_node_id);
CREATE INDEX idx_route_edges_to_node_id ON route_edges(to_node_id);
CREATE INDEX idx_chatbot_documents_location_id ON chatbot_documents(location_id);
CREATE INDEX idx_chatbot_messages_session_id ON chatbot_messages(session_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vendors_updated_at
BEFORE UPDATE ON vendors
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chatbot_documents_updated_at
BEFORE UPDATE ON chatbot_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chatbot_sessions_updated_at
BEFORE UPDATE ON chatbot_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE VIEW location_directory AS
SELECT id, name, slug, type, short_description, block_code, model_object_id,
       source_type, confidence_level, is_verified, is_active
FROM locations
WHERE is_active = TRUE;

CREATE OR REPLACE VIEW searchable_locations AS
SELECT id, name, type, block_code, short_description, description, model_object_id
FROM locations
WHERE is_active = TRUE;

CREATE OR REPLACE VIEW location_facility_directory AS
SELECT l.id AS location_id, l.name AS location_name, l.type AS location_type,
       f.id AS facility_id, f.name AS facility_name
FROM location_facilities lf
JOIN locations l ON l.id = lf.location_id
JOIN facilities f ON f.id = lf.facility_id;

CREATE OR REPLACE VIEW location_vendor_directory AS
SELECT l.id AS location_id, l.name AS location_name, l.type AS location_type,
       v.id AS vendor_id, v.name AS vendor_name, v.category AS vendor_category,
       v.is_verified
FROM vendors v
JOIN locations l ON l.id = v.location_id
WHERE v.is_active = TRUE;
