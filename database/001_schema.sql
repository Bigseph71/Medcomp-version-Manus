-- =============================================================================
-- MedCom Database Schema — PostgreSQL
-- AI-Powered Medication Safety & Senior Protection Application
-- Version: 1.0.0
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SCHEMA: public (application core)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- USERS & AUTHENTICATION
-- -----------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('patient', 'caregiver', 'admin', 'healthcare_professional');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    status user_status NOT NULL DEFAULT 'pending_verification',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender gender_type,
    language VARCHAR(5) DEFAULT 'fr',
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    profile_image_url TEXT,
    biometric_enabled BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    senior_mode_enabled BOOLEAN DEFAULT FALSE,
    gdpr_consent BOOLEAN DEFAULT FALSE,
    gdpr_consent_date TIMESTAMPTZ,
    data_processing_consent BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_token VARCHAR(500),
    device_type VARCHAR(20) NOT NULL, -- 'android', 'ios', 'web'
    device_name VARCHAR(100),
    device_model VARCHAR(100),
    os_version VARCHAR(20),
    app_version VARCHAR(20),
    push_enabled BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_devices_user ON user_devices(user_id);

-- -----------------------------------------------------------------------------
-- HEALTH SCHEMA (Separated for regulatory compliance)
-- -----------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS health;

-- Patient Health Profile
CREATE TABLE health.patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    blood_type VARCHAR(5),
    allergies TEXT[],
    chronic_conditions TEXT[],
    renal_function_egfr DECIMAL(6,2),
    hepatic_function VARCHAR(50),
    pregnancy_status BOOLEAN DEFAULT FALSE,
    breastfeeding_status BOOLEAN DEFAULT FALSE,
    smoking_status VARCHAR(20),
    alcohol_consumption VARCHAR(20),
    notes_encrypted BYTEA,
    last_medical_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_profiles_user ON health.patient_profiles(user_id);

-- -----------------------------------------------------------------------------
-- DRUG INTELLIGENCE ENGINE
-- -----------------------------------------------------------------------------

CREATE TABLE health.drugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    international_name VARCHAR(255),
    active_substances TEXT[] NOT NULL,
    atc_code VARCHAR(10),
    atc_description VARCHAR(255),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    route_of_administration VARCHAR(100),
    manufacturer VARCHAR(255),
    marketing_authorization_number VARCHAR(50),
    marketing_authorization_holder VARCHAR(255),
    ema_product_code VARCHAR(50),
    ansm_cis_code VARCHAR(20),
    fda_ndc_code VARCHAR(20),
    barcode VARCHAR(50),
    contraindications JSONB DEFAULT '[]',
    side_effects JSONB DEFAULT '[]',
    precautions JSONB DEFAULT '[]',
    smpc_url TEXT,
    smpc_parsed JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drugs_name ON health.drugs(name);
CREATE INDEX idx_drugs_atc ON health.drugs(atc_code);
CREATE INDEX idx_drugs_barcode ON health.drugs(barcode);
CREATE INDEX idx_drugs_active_substances ON health.drugs USING GIN(active_substances);

CREATE TYPE interaction_severity AS ENUM ('green', 'yellow', 'red');
CREATE TYPE interaction_type AS ENUM (
    'drug_drug',
    'drug_disease',
    'drug_age',
    'drug_renal',
    'drug_food',
    'drug_allergy',
    'drug_pregnancy',
    'drug_hepatic'
);

CREATE TABLE health.drug_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drug_a_id UUID NOT NULL REFERENCES health.drugs(id),
    drug_b_id UUID REFERENCES health.drugs(id),
    interaction_type interaction_type NOT NULL,
    severity interaction_severity NOT NULL,
    clinical_explanation TEXT NOT NULL,
    patient_explanation TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    mechanism TEXT,
    evidence_level VARCHAR(20),
    confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    sources JSONB NOT NULL DEFAULT '[]',
    condition_trigger VARCHAR(255),
    age_min INTEGER,
    age_max INTEGER,
    renal_threshold DECIMAL(6,2),
    food_trigger VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_drug_a ON health.drug_interactions(drug_a_id);
CREATE INDEX idx_interactions_drug_b ON health.drug_interactions(drug_b_id);
CREATE INDEX idx_interactions_severity ON health.drug_interactions(severity);
CREATE INDEX idx_interactions_type ON health.drug_interactions(interaction_type);

-- Interaction check history (audit trail)
CREATE TABLE health.interaction_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    drugs_checked UUID[] NOT NULL,
    interactions_found JSONB NOT NULL DEFAULT '[]',
    ai_explanations JSONB,
    total_interactions INTEGER DEFAULT 0,
    max_severity interaction_severity,
    check_context JSONB,
    disclaimer_shown BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interaction_checks_user ON health.interaction_checks(user_id);
CREATE INDEX idx_interaction_checks_date ON health.interaction_checks(created_at);

-- -----------------------------------------------------------------------------
-- SMART PILLBOX SYSTEM
-- -----------------------------------------------------------------------------

CREATE TYPE medication_status AS ENUM ('active', 'paused', 'completed', 'cancelled');
CREATE TYPE frequency_type AS ENUM ('daily', 'twice_daily', 'three_times_daily', 'weekly', 'biweekly', 'monthly', 'as_needed', 'custom');
CREATE TYPE food_condition AS ENUM ('before_meal', 'with_meal', 'after_meal', 'empty_stomach', 'no_restriction');
CREATE TYPE dose_status AS ENUM ('pending', 'taken', 'missed', 'skipped', 'snoozed');

CREATE TABLE health.patient_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drug_id UUID REFERENCES health.drugs(id),
    custom_drug_name VARCHAR(255),
    dosage VARCHAR(100) NOT NULL,
    dosage_unit VARCHAR(50) NOT NULL,
    frequency frequency_type NOT NULL DEFAULT 'daily',
    custom_frequency_hours INTEGER,
    food_condition food_condition DEFAULT 'no_restriction',
    start_date DATE NOT NULL,
    end_date DATE,
    duration_days INTEGER,
    status medication_status NOT NULL DEFAULT 'active',
    prescriber_name VARCHAR(255),
    prescription_image_url TEXT,
    notes TEXT,
    reminder_times TIME[] NOT NULL,
    snooze_minutes INTEGER DEFAULT 15,
    max_snooze_count INTEGER DEFAULT 3,
    refill_reminder_enabled BOOLEAN DEFAULT FALSE,
    refill_reminder_days_before INTEGER DEFAULT 7,
    remaining_quantity INTEGER,
    total_quantity INTEGER,
    interaction_checked BOOLEAN DEFAULT FALSE,
    interaction_check_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patient_medications_user ON health.patient_medications(user_id);
CREATE INDEX idx_patient_medications_drug ON health.patient_medications(drug_id);
CREATE INDEX idx_patient_medications_status ON health.patient_medications(status);

CREATE TABLE health.dose_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID NOT NULL REFERENCES health.patient_medications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    scheduled_time TIMESTAMPTZ NOT NULL,
    actual_time TIMESTAMPTZ,
    status dose_status NOT NULL DEFAULT 'pending',
    snooze_count INTEGER DEFAULT 0,
    notes TEXT,
    confirmed_by VARCHAR(20) DEFAULT 'self', -- 'self', 'caregiver', 'auto'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dose_logs_medication ON health.dose_logs(medication_id);
CREATE INDEX idx_dose_logs_user ON health.dose_logs(user_id);
CREATE INDEX idx_dose_logs_scheduled ON health.dose_logs(scheduled_time);
CREATE INDEX idx_dose_logs_status ON health.dose_logs(status);

-- Adherence statistics (pre-computed)
CREATE TABLE health.adherence_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    period_type VARCHAR(10) NOT NULL, -- 'daily', 'weekly', 'monthly'
    total_doses INTEGER NOT NULL DEFAULT 0,
    taken_doses INTEGER NOT NULL DEFAULT 0,
    missed_doses INTEGER NOT NULL DEFAULT 0,
    skipped_doses INTEGER NOT NULL DEFAULT 0,
    adherence_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    risk_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, period_date, period_type)
);

CREATE INDEX idx_adherence_stats_user ON health.adherence_stats(user_id);
CREATE INDEX idx_adherence_stats_date ON health.adherence_stats(period_date);

-- -----------------------------------------------------------------------------
-- SENIOR ALIVE CONFIRMATION SYSTEM
-- -----------------------------------------------------------------------------

CREATE TYPE alive_status AS ENUM ('confirmed', 'pending', 'missed', 'escalated');
CREATE TYPE escalation_level AS ENUM ('none', 'push', 'sms', 'call', 'gps', 'emergency');

CREATE TABLE alive_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE,
    check_interval_hours INTEGER NOT NULL DEFAULT 24,
    check_time TIME NOT NULL DEFAULT '09:00:00',
    grace_period_minutes INTEGER DEFAULT 60,
    escalation_enabled BOOLEAN DEFAULT TRUE,
    escalation_delay_minutes INTEGER DEFAULT 30,
    gps_tracking_enabled BOOLEAN DEFAULT FALSE,
    low_battery_alert_threshold INTEGER DEFAULT 15,
    voice_confirmation_enabled BOOLEAN DEFAULT TRUE,
    offline_failsafe_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alive_config_user ON alive_configurations(user_id);

CREATE TABLE alive_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    confirmed_time TIMESTAMPTZ,
    status alive_status NOT NULL DEFAULT 'pending',
    escalation_level escalation_level DEFAULT 'none',
    escalation_history JSONB DEFAULT '[]',
    gps_latitude DECIMAL(10,8),
    gps_longitude DECIMAL(11,8),
    gps_accuracy DECIMAL(6,2),
    battery_level INTEGER,
    device_info JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alive_checks_user ON alive_checks(user_id);
CREATE INDEX idx_alive_checks_status ON alive_checks(status);
CREATE INDEX idx_alive_checks_scheduled ON alive_checks(scheduled_time);

CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(200) NOT NULL,
    relationship VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    escalation_priority INTEGER NOT NULL DEFAULT 1,
    notify_on_missed_dose BOOLEAN DEFAULT FALSE,
    notify_on_alive_miss BOOLEAN DEFAULT TRUE,
    notify_on_interaction BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);
CREATE INDEX idx_emergency_contacts_priority ON emergency_contacts(escalation_priority);

-- -----------------------------------------------------------------------------
-- CAREGIVER SYSTEM
-- -----------------------------------------------------------------------------

CREATE TYPE caregiver_permission AS ENUM ('view_adherence', 'view_interactions', 'view_alive_status', 'manage_medications', 'full_access');

CREATE TABLE caregiver_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caregiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions caregiver_permission[] NOT NULL DEFAULT '{view_adherence,view_alive_status}',
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMPTZ,
    invitation_token VARCHAR(255),
    invitation_expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(caregiver_id, patient_id)
);

CREATE INDEX idx_caregiver_rel_caregiver ON caregiver_relationships(caregiver_id);
CREATE INDEX idx_caregiver_rel_patient ON caregiver_relationships(patient_id);

-- -----------------------------------------------------------------------------
-- NOTIFICATIONS
-- -----------------------------------------------------------------------------

CREATE TYPE notification_type AS ENUM (
    'dose_reminder',
    'dose_missed',
    'interaction_alert',
    'alive_check',
    'alive_missed',
    'alive_escalation',
    'caregiver_alert',
    'low_battery',
    'refill_reminder',
    'system'
);
CREATE TYPE notification_channel AS ENUM ('push', 'sms', 'email', 'call');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    channel notification_channel NOT NULL DEFAULT 'push',
    status notification_status NOT NULL DEFAULT 'pending',
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at);

-- -----------------------------------------------------------------------------
-- AUDIT & LOGGING (Regulatory Compliance)
-- -----------------------------------------------------------------------------

CREATE TYPE audit_action AS ENUM (
    'login', 'logout', 'register',
    'view_profile', 'update_profile',
    'add_medication', 'update_medication', 'delete_medication',
    'check_interaction', 'view_interaction',
    'confirm_alive', 'miss_alive', 'escalate_alive',
    'dose_taken', 'dose_missed', 'dose_skipped',
    'export_report', 'consent_given', 'consent_revoked',
    'caregiver_linked', 'caregiver_removed',
    'data_access', 'data_export', 'data_deletion',
    'system_error', 'security_event'
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action audit_action NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    risk_level VARCHAR(20) DEFAULT 'low',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Incident logging (MDR compliance)
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by UUID REFERENCES users(id),
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    affected_users UUID[],
    root_cause TEXT,
    corrective_actions TEXT,
    status VARCHAR(20) DEFAULT 'open',
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);

-- GDPR Consent Management
CREATE TABLE gdpr_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL,
    consent_version VARCHAR(20) NOT NULL,
    is_granted BOOLEAN NOT NULL,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gdpr_consents_user ON gdpr_consents(user_id);
CREATE INDEX idx_gdpr_consents_type ON gdpr_consents(consent_type);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON health.patient_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON health.drugs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_interactions_updated_at BEFORE UPDATE ON health.drug_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_medications_updated_at BEFORE UPDATE ON health.patient_medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dose_logs_updated_at BEFORE UPDATE ON health.dose_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alive_configurations_updated_at BEFORE UPDATE ON alive_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alive_checks_updated_at BEFORE UPDATE ON alive_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_caregiver_relationships_updated_at BEFORE UPDATE ON caregiver_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA — Sample Drug Interactions
-- =============================================================================

-- Note: In production, this would be loaded from EMA/ANSM/FDA databases
-- These are examples for demonstration purposes only
