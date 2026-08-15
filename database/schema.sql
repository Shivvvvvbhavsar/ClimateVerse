-- ==============================================================================
-- ClimateVerse database schema (reference export)
-- ==============================================================================
-- This file is a PostgreSQL-flavored reference export of the SQLAlchemy models
-- defined in backend/app/models.py. It documents the full 23-table schema for
-- reference purposes (e.g. if porting to a hosted PostgreSQL/PostGIS instance).
--
-- The RUNNING APPLICATION DOES NOT execute this file. By default it uses
-- SQLite, and the schema is created automatically and idempotently via
-- SQLAlchemy's Base.metadata.create_all() on backend startup — no manual
-- table creation is ever required.
--
-- To port to PostgreSQL + PostGIS:
--   1. Set DATABASE_URL to a postgresql:// connection string in .env
--   2. Add `geometry` / PostGIS columns as needed for spatial queries
--      (lat/lng and JSON path fields are used in SQLite mode as a
--      dependency-free stand-in for PostGIS geometry columns)
--   3. Run the app once — SQLAlchemy will create all tables automatically
-- ==============================================================================

CREATE TABLE cities (
	id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	country VARCHAR, 
	state VARCHAR, 
	latitude FLOAT, 
	longitude FLOAT, 
	population INTEGER, 
	area_sq_km FLOAT, 
	is_demo_data BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);
CREATE TABLE data_sources (
	id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	source_type VARCHAR, 
	description TEXT, 
	is_demo_data BOOLEAN, 
	PRIMARY KEY (id)
);
CREATE TABLE users (
	id VARCHAR NOT NULL, 
	email VARCHAR NOT NULL, 
	hashed_password VARCHAR NOT NULL, 
	full_name VARCHAR, 
	role VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);
CREATE TABLE audit_logs (
	id VARCHAR NOT NULL, 
	user_id VARCHAR, 
	action VARCHAR NOT NULL, 
	detail JSON, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE disasters (
	id VARCHAR NOT NULL, 
	city_id VARCHAR NOT NULL, 
	disaster_type VARCHAR NOT NULL, 
	year INTEGER, 
	severity FLOAT, 
	affected_population INTEGER, 
	affected_buildings INTEGER, 
	economic_loss_crore FLOAT, 
	ai_recommendation TEXT, 
	timeline JSON, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);
CREATE TABLE districts (
	id VARCHAR NOT NULL, 
	city_id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	population INTEGER, 
	center_lat FLOAT, 
	center_lng FLOAT, 
	district_type VARCHAR, 
	is_demo_data BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);
CREATE TABLE energy_systems (
	id VARCHAR NOT NULL, 
	city_id VARCHAR NOT NULL, 
	source_type VARCHAR, 
	capacity_mw FLOAT, 
	x FLOAT, 
	z FLOAT, 
	is_demo_data BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);
CREATE TABLE forests (
	id VARCHAR NOT NULL, 
	city_id VARCHAR NOT NULL, 
	name VARCHAR, 
	center_x FLOAT, 
	center_z FLOAT, 
	radius FLOAT, 
	tree_count INTEGER, 
	carbon_storage_tons FLOAT, 
	biodiversity_index FLOAT, 
	is_demo_data BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);
CREATE TABLE industries (
	id VARCHAR NOT NULL, 
	city_id VARCHAR NOT NULL, 
	name VARCHAR, 
	sector VARCHAR, 
	x FLOAT, 
	z FLOAT, 
	emissions_tons_co2 FLOAT, 
	employees INTEGER, 
	upgraded BOOLEAN, 
	is_demo_data BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);
CREATE TABLE roads (
	id VARCHAR NOT NULL, 
	city_id VARCHAR NOT NULL, 
	name VARCHAR, 
	road_type VARCHAR, 
	path JSON, 
	traffic_level FLOAT, 
	is_demo_data BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);
CREATE TABLE scenarios (
	id VARCHAR NOT NULL, 
	user_id VARCHAR, 
	city_id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	goal VARCHAR, 
	target_pct FLOAT, 
	budget_crore FLOAT, 
	start_year INTEGER, 
	end_year INTEGER, 
	interventions JSON, 
	constraints JSON, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);
CREATE TABLE transport_systems (
	id VARCHAR NOT NULL, 
	city_id VARCHAR NOT NULL, 
	mode VARCHAR, 
	fleet_size INTEGER, 
	daily_ridership INTEGER, 
	is_demo_data BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);
CREATE TABLE water_bodies (
	id VARCHAR NOT NULL, 
	city_id VARCHAR NOT NULL, 
	name VARCHAR, 
	body_type VARCHAR, 
	path JSON, 
	water_quality_index FLOAT, 
	water_level_pct FLOAT, 
	flood_risk FLOAT, 
	is_demo_data BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);
CREATE TABLE buildings (
	id VARCHAR NOT NULL, 
	city_id VARCHAR NOT NULL, 
	district_id VARCHAR, 
	building_type VARCHAR, 
	lat FLOAT, 
	lng FLOAT, 
	x FLOAT, 
	z FLOAT, 
	height FLOAT, 
	footprint_w FLOAT, 
	footprint_d FLOAT, 
	energy_kwh FLOAT, 
	water_liters FLOAT, 
	co2_kg FLOAT, 
	has_solar BOOLEAN, 
	is_demo_data BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id), 
	FOREIGN KEY(district_id) REFERENCES districts (id)
);
CREATE TABLE citizen_impacts (
	id VARCHAR NOT NULL, 
	scenario_id VARCHAR, 
	year INTEGER, 
	public_acceptance_pct FLOAT, 
	happiness_index FLOAT, 
	health_impact_index FLOAT, 
	avg_commute_minutes FLOAT, 
	electricity_cost_index FLOAT, 
	policy_adoption_pct FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(scenario_id) REFERENCES scenarios (id)
);
CREATE TABLE economic_impacts (
	id VARCHAR NOT NULL, 
	scenario_id VARCHAR, 
	year INTEGER, 
	gdp_billion_usd FLOAT, 
	investment_crore FLOAT, 
	roi_pct FLOAT, 
	revenue_crore FLOAT, 
	tax_crore FLOAT, 
	cost_crore FLOAT, 
	payback_years FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(scenario_id) REFERENCES scenarios (id)
);
CREATE TABLE employment_impacts (
	id VARCHAR NOT NULL, 
	scenario_id VARCHAR, 
	sector VARCHAR NOT NULL, 
	jobs_lost INTEGER, 
	jobs_created INTEGER, 
	net_employment INTEGER, 
	skill_transition JSON, 
	workforce_demand JSON, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(scenario_id) REFERENCES scenarios (id)
);
CREATE TABLE policies (
	id VARCHAR NOT NULL, 
	scenario_id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	description TEXT, 
	interventions JSON, 
	cost_crore FLOAT, 
	co2_reduction_pct FLOAT, 
	aqi_impact FLOAT, 
	water_impact_pct FLOAT, 
	jobs_created INTEGER, 
	gdp_impact_pct FLOAT, 
	roi_pct FLOAT, 
	renewable_pct FLOAT, 
	green_cover_pct FLOAT, 
	citizen_acceptance FLOAT, 
	implementation_difficulty FLOAT, 
	disaster_resilience FLOAT, 
	rank INTEGER, 
	score FLOAT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(scenario_id) REFERENCES scenarios (id)
);
CREATE TABLE debates (
	id VARCHAR NOT NULL, 
	policy_id VARCHAR NOT NULL, 
	topic VARCHAR, 
	final_recommendation TEXT, 
	coordinator_confidence FLOAT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(policy_id) REFERENCES policies (id)
);
CREATE TABLE policy_metrics (
	id VARCHAR NOT NULL, 
	policy_id VARCHAR NOT NULL, 
	metric_name VARCHAR NOT NULL, 
	metric_value FLOAT, 
	unit VARCHAR, 
	PRIMARY KEY (id), 
	FOREIGN KEY(policy_id) REFERENCES policies (id)
);
CREATE TABLE reports (
	id VARCHAR NOT NULL, 
	scenario_id VARCHAR, 
	policy_id VARCHAR, 
	report_type VARCHAR NOT NULL, 
	title VARCHAR, 
	format VARCHAR, 
	content_path VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(scenario_id) REFERENCES scenarios (id), 
	FOREIGN KEY(policy_id) REFERENCES policies (id)
);
CREATE TABLE simulation_runs (
	id VARCHAR NOT NULL, 
	scenario_id VARCHAR NOT NULL, 
	policy_id VARCHAR, 
	status VARCHAR, 
	started_at TIMESTAMP WITHOUT TIME ZONE, 
	completed_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(scenario_id) REFERENCES scenarios (id), 
	FOREIGN KEY(policy_id) REFERENCES policies (id)
);
CREATE TABLE agent_outputs (
	id VARCHAR NOT NULL, 
	simulation_run_id VARCHAR, 
	policy_id VARCHAR, 
	agent_name VARCHAR NOT NULL, 
	recommendation TEXT, 
	reasoning TEXT, 
	metrics JSON, 
	risks JSON, 
	confidence FLOAT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(simulation_run_id) REFERENCES simulation_runs (id), 
	FOREIGN KEY(policy_id) REFERENCES policies (id)
);
CREATE TABLE debate_messages (
	id VARCHAR NOT NULL, 
	debate_id VARCHAR NOT NULL, 
	agent_name VARCHAR NOT NULL, 
	message TEXT, 
	confidence FLOAT, 
	sequence INTEGER, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(debate_id) REFERENCES debates (id)
);
CREATE TABLE simulation_years (
	id VARCHAR NOT NULL, 
	simulation_run_id VARCHAR NOT NULL, 
	year INTEGER NOT NULL, 
	aqi FLOAT, 
	co2_mt FLOAT, 
	temperature_c FLOAT, 
	water_availability_pct FLOAT, 
	green_cover_pct FLOAT, 
	population INTEGER, 
	renewable_pct FLOAT, 
	gdp_billion_usd FLOAT, 
	employment_index FLOAT, 
	ev_adoption_pct FLOAT, 
	biodiversity_index FLOAT, 
	sustainability_score FLOAT, 
	sdg_score FLOAT, 
	explanation JSON, 
	PRIMARY KEY (id), 
	FOREIGN KEY(simulation_run_id) REFERENCES simulation_runs (id)
);
