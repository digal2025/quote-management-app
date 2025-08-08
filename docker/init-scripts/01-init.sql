-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSONB for better performance
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired');
CREATE TYPE interaction_action AS ENUM ('viewed', 'downloaded', 'shared', 'accepted', 'rejected');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_quotes_organization_id ON quotes(organization_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_quote_views_quote_id ON quote_views(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_interactions_quote_id ON quote_interactions(quote_id);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_quotes_search ON quotes USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(company_name, '')));

-- Insert default NZ GST settings
INSERT INTO gst_settings (organization_id, gst_number, gst_rate, is_gst_registered) 
VALUES (NULL, 'DEFAULT', 0.15, true) ON CONFLICT DO NOTHING; 