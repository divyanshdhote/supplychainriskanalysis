-- =============================================================================
-- Supply Chain Risk Analysis – Initial Seed Data
-- Matches the local PostgreSQL database as of April 2026
-- =============================================================================

-- ─── Nodes ───────────────────────────────────────────────────────────────────
INSERT INTO node (id, name, type, tier, country, region, operating_status, inventory_buffer_days)
OVERRIDING SYSTEM VALUE
VALUES
  (14, 'Your Company',         'RETAILER',     0, 'India',     'Central',     'ACTIVE', 3),
  (15, 'Distributor North',    'DISTRIBUTOR',  1, 'India',     'North',       'ACTIVE', 5),
  (16, 'Distributor South',    'DISTRIBUTOR',  1, 'India',     'South',       'ACTIVE', 6),
  (17, 'Distributor Export',   'DISTRIBUTOR',  1, 'India',     'West',        'ACTIVE', 7),
  (18, 'Warehouse Delhi',      'WAREHOUSE',    2, 'India',     'North',       'ACTIVE', 7),
  (19, 'Warehouse Mumbai',     'WAREHOUSE',    2, 'India',     'West',        'ACTIVE', 8),
  (20, 'Warehouse Chennai',    'WAREHOUSE',    2, 'India',     'South',       'ACTIVE', 6),
  (21, 'Factory A',            'FACTORY',      3, 'India',     'West',        'ACTIVE', 4),
  (22, 'Factory B',            'FACTORY',      3, 'India',     'South',       'ACTIVE', 5),
  (23, 'Factory C (Backup)',   'FACTORY',      3, 'Vietnam',   'APAC',        'ACTIVE', 6),
  (24, 'Supplier Steel',       'SUPPLIER',     4, 'China',     'Asia',        'ACTIVE', 6),
  (25, 'Supplier Plastic',     'SUPPLIER',     4, 'India',     'West',        'ACTIVE', 5),
  (26, 'Supplier Electronics', 'SUPPLIER',     4, 'Taiwan',    'APAC',        'ACTIVE', 5),
  (27, 'Supplier Packaging',   'SUPPLIER',     4, 'India',     'North',       'ACTIVE', 4),
  (28, 'Iron Ore Mine',        'SUB_SUPPLIER', 5, 'Australia', 'APAC',        'ACTIVE', 10),
  (29, 'Crude Oil Plant',      'SUB_SUPPLIER', 5, 'UAE',       'Middle East', 'ACTIVE', 9),
  (30, 'Silicon Mine',         'SUB_SUPPLIER', 5, 'Chile',     'LATAM',       'ACTIVE', 8),
  (31, 'Paper Mill',           'SUB_SUPPLIER', 5, 'Indonesia', 'APAC',        'ACTIVE', 7)
ON CONFLICT (id) DO NOTHING;

-- Keep the identity sequence in sync with the highest inserted id
SELECT setval(pg_get_serial_sequence('node', 'id'), MAX(id)) FROM node;

-- ─── Edges ───────────────────────────────────────────────────────────────────
INSERT INTO edge (id, from_node_id, to_node_id, lead_time_days, disruption_probability, impact_severity)
OVERRIDING SYSTEM VALUE
VALUES
  (14, 28, 24, 9, 0.7, 0.9),
  (15, 24, 21, 7, 0.6, 0.8),
  (16, 21, 19, 6, 0.5, 0.8),
  (17, 19, 16, 5, 0.4, 0.7),
  (18, 16, 14, 4, 0.3, 0.6),
  (19, 29, 25, 6, 0.3, 0.6),
  (20, 25, 22, 5, 0.3, 0.5),
  (21, 22, 18, 4, 0.2, 0.4),
  (22, 18, 15, 3, 0.2, 0.3),
  (23, 15, 14, 2, 0.1, 0.2),
  (24, 30, 26, 8, 0.6, 0.9),
  (25, 26, 21, 5, 0.5, 0.8),
  (26, 31, 27, 5, 0.2, 0.4),
  (27, 27, 23, 4, 0.2, 0.3),
  (28, 25, 21, 4, 0.4, 0.6),
  (29, 24, 22, 5, 0.5, 0.7),
  (30, 26, 22, 6, 0.4, 0.7)
ON CONFLICT (id) DO NOTHING;

-- Keep the identity sequence in sync
SELECT setval(pg_get_serial_sequence('edge', 'id'), MAX(id)) FROM edge;
