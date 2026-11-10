-- ==============================================================================
-- BRANDGUARD AI - ENTERPRISE MULTI-TENANT SUPABASE POSTGRESQL SCHEMA
-- Tagline: "Every piece of content. One consistent brand."
-- Version: 2.1.0 (Hardened Concurrency & Immutable Audit Review)
-- ==============================================================================
-- Architecture & Invariants:
-- 1. Multi-Tenant Organisation Isolation via organisation_members and RLS
-- 2. Role-Based Access Control (RBAC): 'owner', 'admin', 'reviewer', 'creator'
-- 3. Row-level concurrency locking on organisations to prevent last-owner race conditions
-- 4. Immutable revision_history with zero application-role UPDATE/DELETE policies
-- 5. Dedicated service-role retention mechanism for regulatory audit pruning
-- 6. Defense-in-depth no-self-approval enforcement for brand governance
-- 7. Pinned search_path and schema-qualified object references across all functions
-- 8. Zero-dependency seed data compatible with 100% fresh Supabase instances
-- ==============================================================================

-- Enable standard UUID & Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TENANCY & IDENTITY TABLES
-- ==============================================================================

-- 1.1 ORGANISATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 1.2 ORGANISATION MEMBERS TABLE (RBAC)
CREATE TABLE IF NOT EXISTS public.organisation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL DEFAULT 'creator' CHECK (role IN ('owner', 'admin', 'reviewer', 'creator')),
    CONSTRAINT uq_organisation_member UNIQUE (organisation_id, user_id)
);

-- 1.3 USER PROFILES TABLE (Linked to auth.users; nullable email for OAuth/SMS/anonymous)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255) NOT NULL DEFAULT 'BrandGuard Member',
    avatar_url TEXT,
    department VARCHAR(100) DEFAULT 'Brand Marketing',
    job_title VARCHAR(100) DEFAULT 'Content Specialist'
);

-- ==============================================================================
-- 2. BRAND SPECIFICATION & GOVERNANCE TABLES
-- ==============================================================================

-- 2.1 BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    logo_url TEXT,
    primary_color VARCHAR(30) DEFAULT '#8B5CF6',
    health_score NUMERIC(5, 2) DEFAULT 90.00 CHECK (health_score >= 0.00 AND health_score <= 100.00),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT uq_brand_org_slug UNIQUE (organisation_id, slug)
);

-- 2.2 BRAND GUIDELINES TABLE
CREATE TABLE IF NOT EXISTS public.brand_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(30) NOT NULL DEFAULT 'v1.0',
    reading_level VARCHAR(100) DEFAULT 'Grade 8 - 10 (Flesch-Kincaid)',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2.3 BRAND TONE TRAITS TABLE
CREATE TABLE IF NOT EXISTS public.brand_tone_traits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_id UUID NOT NULL REFERENCES public.brand_guidelines(id) ON DELETE CASCADE,
    trait VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.4 BRAND DISCLAIMERS TABLE
CREATE TABLE IF NOT EXISTS public.brand_disclaimers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_id UUID NOT NULL REFERENCES public.brand_guidelines(id) ON DELETE CASCADE,
    channel_or_context VARCHAR(100) NOT NULL,
    disclaimer_text TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.5 BRAND TAGLINES TABLE
CREATE TABLE IF NOT EXISTS public.brand_taglines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_id UUID NOT NULL REFERENCES public.brand_guidelines(id) ON DELETE CASCADE,
    tagline TEXT NOT NULL,
    context_notes TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.6 BRAND RULES & PROHIBITIONS TABLE
CREATE TABLE IF NOT EXISTS public.brand_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_id UUID NOT NULL REFERENCES public.brand_guidelines(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('tone', 'terminology', 'legal', 'formatting')),
    rule_name VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'warning' CHECK (severity IN ('critical', 'warning', 'suggestion')),
    banned_pattern TEXT,
    preferred_alternative TEXT,
    explanation TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 3. CONTENT SUBMISSIONS & AI COMPLIANCE TABLES
-- ==============================================================================

-- 3.1 CONTENT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.content_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    guideline_id UUID REFERENCES public.brand_guidelines(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    title VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('website', 'social', 'email', 'blog', 'press_release', 'ad_copy', 'other')),
    target_audience VARCHAR(255),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(100),
    department VARCHAR(100),
    content_body TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'analyzing', 'needs_revision', 'in_review', 'approved', 'rejected')),
    current_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    latest_score NUMERIC(5, 2) CHECK (latest_score IS NULL OR (latest_score >= 0.00 AND latest_score <= 100.00)),
    word_count INTEGER DEFAULT 0
);

-- 3.2 COMPLIANCE AUDIT REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.content_submissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    overall_score NUMERIC(5, 2) NOT NULL CHECK (overall_score >= 0.00 AND overall_score <= 100.00),
    grade VARCHAR(10) NOT NULL,
    verdict VARCHAR(100) NOT NULL,
    tone_score NUMERIC(5, 2) CHECK (tone_score >= 0.00 AND tone_score <= 100.00),
    terminology_score NUMERIC(5, 2) CHECK (terminology_score >= 0.00 AND terminology_score <= 100.00),
    legal_score NUMERIC(5, 2) CHECK (legal_score >= 0.00 AND legal_score <= 100.00),
    formatting_score NUMERIC(5, 2) CHECK (formatting_score >= 0.00 AND formatting_score <= 100.00),
    summary TEXT NOT NULL,
    suggested_improvements TEXT,
    ai_model_used VARCHAR(100) DEFAULT 'server-secure-llm',
    execution_time_ms INTEGER,
    raw_analysis JSONB
);

-- 3.3 FLAGGED COMPLIANCE VIOLATIONS TABLE
CREATE TABLE IF NOT EXISTS public.compliance_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.compliance_reports(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.brand_rules(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('tone', 'terminology', 'legal', 'formatting')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'warning', 'suggestion')),
    flagged_text TEXT NOT NULL,
    location_context VARCHAR(100),
    start_char_index INTEGER,
    end_char_index INTEGER,
    issue_description TEXT NOT NULL,
    suggested_fix TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored'))
);

-- 3.4 REVISION HISTORY TABLE (Immutable Audit Log)
CREATE TABLE IF NOT EXISTS public.revision_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.content_submissions(id) ON DELETE CASCADE,
    version_tag VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    content_snapshot TEXT NOT NULL,
    change_summary TEXT,
    score_at_revision NUMERIC(5, 2) CHECK (score_at_revision IS NULL OR (score_at_revision >= 0.00 AND score_at_revision <= 100.00))
);

-- 3.5 REVIEWS & APPROVAL ACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.review_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.content_submissions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    reviewer_role VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN ('approved', 'rejected', 'requested_changes', 'comment')),
    comments TEXT
);

-- ==============================================================================
-- 4. DATABASE INDEXES FOR QUERY OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_members_org_user ON public.organisation_members(organisation_id, user_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.organisation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_org_id ON public.brands(organisation_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_brand_id ON public.brand_guidelines(brand_id);
CREATE INDEX IF NOT EXISTS idx_rules_guideline_id ON public.brand_rules(guideline_id);
CREATE INDEX IF NOT EXISTS idx_submissions_org_brand ON public.content_submissions(organisation_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_submissions_author ON public.content_submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.content_submissions(status);
CREATE INDEX IF NOT EXISTS idx_reports_submission_id ON public.compliance_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_violations_report_id ON public.compliance_violations(report_id);
CREATE INDEX IF NOT EXISTS idx_revisions_submission_id ON public.revision_history(submission_id);
CREATE INDEX IF NOT EXISTS idx_reviews_submission_id ON public.review_actions(submission_id);

-- ==============================================================================
-- 5. SECURITY DEFINER HELPER FUNCTIONS (PINNED SEARCH_PATH)
-- ==============================================================================

-- 5.1 Helper: Get all organisation IDs the current authenticated user belongs to
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS TABLE (org_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT om.organisation_id
    FROM public.organisation_members om
    WHERE om.user_id = auth.uid();
$$;

-- 5.2 Helper: Verify whether current user is an active member of target organisation
CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organisation_members om
        WHERE om.organisation_id = target_org_id
          AND om.user_id = auth.uid()
    );
$$;

-- 5.3 Helper: Verify whether current user holds specific roles in target organisation
CREATE OR REPLACE FUNCTION public.is_org_role(target_org_id UUID, allowed_roles VARCHAR[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organisation_members om
        WHERE om.organisation_id = target_org_id
          AND om.user_id = auth.uid()
          AND om.role = ANY(allowed_roles)
    );
$$;

-- 5.4 Helper: Shortcut check for admin or owner status
CREATE OR REPLACE FUNCTION public.is_org_admin_or_owner(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT public.is_org_role(target_org_id, ARRAY['owner', 'admin']::VARCHAR[]);
$$;

-- ==============================================================================
-- 6. AUDIT & UPDATED_AT TRIGGERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_organisations_updated_at ON public.organisations;
CREATE TRIGGER trg_organisations_updated_at
    BEFORE UPDATE ON public.organisations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_members_updated_at ON public.organisation_members;
CREATE TRIGGER trg_members_updated_at
    BEFORE UPDATE ON public.organisation_members
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_brands_updated_at ON public.brands;
CREATE TRIGGER trg_brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_guidelines_updated_at ON public.brand_guidelines;
CREATE TRIGGER trg_guidelines_updated_at
    BEFORE UPDATE ON public.brand_guidelines
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_submissions_updated_at ON public.content_submissions;
CREATE TRIGGER trg_submissions_updated_at
    BEFORE UPDATE ON public.content_submissions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 7. SECURITY, INTEGRITY & CONCURRENCY TRIGGERS
-- ==============================================================================

-- 7.1 Prevent Privilege Escalation & Last-Owner Demotion/Removal with Explicit Concurrency Locking
CREATE OR REPLACE FUNCTION public.protect_organisation_members_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    target_org_id UUID;
    caller_role VARCHAR(30);
    remaining_owners INTEGER;
BEGIN
    target_org_id := COALESCE(NEW.organisation_id, OLD.organisation_id);

    -- 1. CRITICAL CONCURRENCY LOCK:
    -- If modifying an owner's role or deleting an owner, acquire an exclusive row lock
    -- on the parent organisation. This serializes concurrent demotions/deletions and
    -- prevents race conditions where simultaneous transactions leave an organisation ownerless.
    IF (TG_OP = 'UPDATE' AND (OLD.role = 'owner' OR NEW.role = 'owner')) OR (TG_OP = 'DELETE' AND OLD.role = 'owner') THEN
        PERFORM 1
        FROM public.organisations o
        WHERE o.id = target_org_id
        FOR UPDATE;
    END IF;

    -- Look up caller role in the target organisation
    SELECT om.role INTO caller_role
    FROM public.organisation_members om
    WHERE om.organisation_id = target_org_id
      AND om.user_id = auth.uid();

    IF TG_OP = 'UPDATE' THEN
        -- Prevent changing immutable membership identifiers
        IF NEW.organisation_id != OLD.organisation_id OR NEW.user_id != OLD.user_id THEN
            RAISE EXCEPTION 'Membership identifiers (organisation_id, user_id) cannot be modified.';
        END IF;

        -- Role modification validation
        IF NEW.role != OLD.role THEN
            -- Only an owner can promote a user to owner
            IF NEW.role = 'owner' AND caller_role != 'owner' THEN
                RAISE EXCEPTION 'Only an organisation owner can promote a member to owner.';
            END IF;

            -- Admins cannot modify owners
            IF OLD.role = 'owner' AND caller_role != 'owner' THEN
                RAISE EXCEPTION 'Only an organisation owner can modify an existing owner account.';
            END IF;

            -- Prevent demoting the last owner
            IF OLD.role = 'owner' AND NEW.role != 'owner' THEN
                SELECT COUNT(*) INTO remaining_owners
                FROM public.organisation_members om
                WHERE om.organisation_id = target_org_id
                  AND om.role = 'owner'
                  AND om.user_id != OLD.user_id;

                IF remaining_owners = 0 THEN
                    RAISE EXCEPTION 'Cannot demote the last owner. Promote another member to owner first.';
                END IF;
            END IF;

            -- Non-admin/non-owner members cannot modify roles
            IF caller_role NOT IN ('owner', 'admin') THEN
                RAISE EXCEPTION 'Insufficient permissions to alter member roles.';
            END IF;
        END IF;

        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        -- Prevent deleting the last owner
        IF OLD.role = 'owner' THEN
            SELECT COUNT(*) INTO remaining_owners
            FROM public.organisation_members om
            WHERE om.organisation_id = target_org_id
              AND om.role = 'owner'
              AND om.user_id != OLD.user_id;

            IF remaining_owners = 0 THEN
                RAISE EXCEPTION 'Cannot remove the last owner of an organisation.';
            END IF;

            -- Admins cannot delete an owner
            IF caller_role != 'owner' AND auth.uid() != OLD.user_id THEN
                RAISE EXCEPTION 'Only an organisation owner can remove another owner account.';
            END IF;
        END IF;

        -- Non-admin/non-owner members can only remove themselves (leave organisation)
        IF caller_role NOT IN ('owner', 'admin') AND auth.uid() != OLD.user_id THEN
            RAISE EXCEPTION 'Insufficient permissions to remove other members.';
        END IF;

        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_members ON public.organisation_members;
CREATE TRIGGER trg_protect_members
    BEFORE UPDATE OR DELETE ON public.organisation_members
    FOR EACH ROW EXECUTE FUNCTION public.protect_organisation_members_integrity();

-- 7.2 Protect Submission Ownership & Prevent Author Spoofing
CREATE OR REPLACE FUNCTION public.protect_submission_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Prevent altering organisation_id
    IF NEW.organisation_id != OLD.organisation_id THEN
        RAISE EXCEPTION 'Submissions cannot be transferred between organisations.';
    END IF;

    -- Prevent regular authors from altering author_id to bypass self-approval
    IF NEW.author_id IS DISTINCT FROM OLD.author_id THEN
        IF NOT public.is_org_admin_or_owner(OLD.organisation_id) THEN
            RAISE EXCEPTION 'Content authors are not permitted to modify submission author_id.';
        END IF;
    END IF;

    -- Prevent clearing author_id once established
    IF OLD.author_id IS NOT NULL AND NEW.author_id IS NULL THEN
        RAISE EXCEPTION 'author_id cannot be cleared or set to NULL.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_submission ON public.content_submissions;
CREATE TRIGGER trg_protect_submission
    BEFORE UPDATE ON public.content_submissions
    FOR EACH ROW EXECUTE FUNCTION public.protect_submission_ownership();

-- 7.3 Enforce No-Self-Approval Rule on review_actions
-- 7.3 Validate organisation, brand and guideline consistency
CREATE OR REPLACE FUNCTION public.validate_submission_brand_consistency()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    brand_org_id UUID;
    guideline_brand_id UUID;
BEGIN
    SELECT organisation_id
    INTO brand_org_id
    FROM public.brands
    WHERE id = NEW.brand_id;

    IF brand_org_id IS DISTINCT FROM NEW.organisation_id THEN
        RAISE EXCEPTION
            'The selected brand does not belong to this organisation.';
    END IF;

    IF NEW.guideline_id IS NOT NULL THEN
        SELECT brand_id
        INTO guideline_brand_id
        FROM public.brand_guidelines
        WHERE id = NEW.guideline_id;

        IF guideline_brand_id IS DISTINCT FROM NEW.brand_id THEN
            RAISE EXCEPTION
                'The selected guideline does not belong to the selected brand.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_submission_brand_consistency
ON public.content_submissions;

CREATE TRIGGER trg_validate_submission_brand_consistency
BEFORE INSERT OR UPDATE OF organisation_id, brand_id, guideline_id
ON public.content_submissions
FOR EACH ROW
EXECUTE FUNCTION public.validate_submission_brand_consistency();
CREATE OR REPLACE FUNCTION public.enforce_no_self_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    sub_author UUID;
    sub_org_id UUID;
    caller_role VARCHAR(30);
BEGIN
    -- Reviewer ID must match authenticated caller if called directly
    IF auth.uid() IS NOT NULL AND NEW.reviewer_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Reviewer ID must match authenticated user ID.';
    END IF;

    -- Lookup submission author and tenant
    SELECT cs.author_id, cs.organisation_id INTO sub_author, sub_org_id
    FROM public.content_submissions cs
    WHERE cs.id = NEW.submission_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target content submission does not exist.';
    END IF;

    -- Ensure reviewer is an authorized member of this organisation
    IF auth.uid() IS NOT NULL THEN
        SELECT om.role INTO caller_role
        FROM public.organisation_members om
        WHERE om.organisation_id = sub_org_id
          AND om.user_id = auth.uid();

        IF caller_role NOT IN ('reviewer', 'admin', 'owner') THEN
            RAISE EXCEPTION 'Only designated reviewers, admins, or owners can execute review actions.';
        END IF;
    END IF;

    -- Enforce No-Self-Approval rule on approvals
    IF NEW.action_type = 'approved' THEN
        IF sub_author IS NULL THEN
            RAISE EXCEPTION 'Cannot approve an unauthored or unverified submission.';
        END IF;

        IF NEW.reviewer_id = sub_author THEN
            RAISE EXCEPTION 'Governance violation: Authors are not permitted to approve their own submissions.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_no_self_approval ON public.review_actions;
CREATE TRIGGER trg_enforce_no_self_approval
    BEFORE INSERT ON public.review_actions
    FOR EACH ROW EXECUTE FUNCTION public.enforce_no_self_approval();

-- 7.4 Immutable Revision History Trigger
CREATE OR REPLACE FUNCTION public.protect_revision_history_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Allow deletion only when administrative retention cleanup session flag is active
    IF auth.role() = 'service_role'
   AND current_setting('brandguard.retention_cleanup_active', true) = 'on'
THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
    END IF;

    RAISE EXCEPTION 'Immutable audit log violation: revision_history records cannot be modified or deleted by application users.';
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_revision_history ON public.revision_history;
CREATE TRIGGER trg_protect_revision_history
    BEFORE UPDATE OR DELETE ON public.revision_history
    FOR EACH ROW EXECUTE FUNCTION public.protect_revision_history_immutability();

-- 7.5 Robust auth.users Registration Trigger (Handles Nullable Emails, Phone, & OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    user_email VARCHAR(255);
    user_name VARCHAR(255);
BEGIN
    user_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', NULL);

    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        CASE
            WHEN user_email IS NOT NULL AND POSITION('@' in user_email) > 1
            THEN SPLIT_PART(user_email, '@', 1)
            ELSE 'BrandGuard Member'
        END
    );

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        department,
        job_title
    )
    VALUES (
        NEW.id,
        user_email,
        user_name,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Brand Marketing'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Content Specialist')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        full_name = EXCLUDED.full_name,
        updated_at = TIMEZONE('utc'::text, NOW());

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user non-fatal warning: %', SQLERRM;
        RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 8. ONBOARDING, DEMO & RETENTION RPC FUNCTIONS
-- ==============================================================================

-- 8.1 Secure Organisation Creation RPC (Assigns Creator as Owner)
CREATE OR REPLACE FUNCTION public.create_organisation(org_name VARCHAR, org_slug VARCHAR)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    new_org_id UUID;
    clean_slug VARCHAR(255);
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required to create an organisation.';
    END IF;

    clean_slug := LOWER(REGEXP_REPLACE(TRIM(org_slug), '[^a-zA-Z0-9\-]', '-', 'g'));

    INSERT INTO public.organisations (name, slug, is_demo, created_by)
    VALUES (TRIM(org_name), clean_slug, false, auth.uid())
    RETURNING id INTO new_org_id;

    INSERT INTO public.organisation_members (organisation_id, user_id, role)
    VALUES (new_org_id, auth.uid(), 'owner');

    RETURN new_org_id;
END;
$$;

-- 8.2 Safe Demo Organisation Access RPC
CREATE OR REPLACE FUNCTION public.join_demo_organisation()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    demo_org_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required to join demo organisation.';
    END IF;

    SELECT o.id INTO demo_org_id
    FROM public.organisations o
    WHERE o.is_demo = true
    ORDER BY o.created_at ASC
    LIMIT 1;

    IF demo_org_id IS NULL THEN
        RAISE EXCEPTION 'No active demo workspace is configured on this instance.';
    END IF;

    INSERT INTO public.organisation_members (organisation_id, user_id, role)
    VALUES (demo_org_id, auth.uid(), 'creator')
    ON CONFLICT (organisation_id, user_id) DO NOTHING;

    RETURN demo_org_id;
END;
$$;

-- 8.3 Administrative Revision History Retention Pruning RPC
-- Dedicated maintenance routine: restricted strictly to service_role or superuser.
CREATE OR REPLACE FUNCTION public.purge_retention_revisions(
    target_org_id UUID,
    retention_days INTEGER DEFAULT 1095
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    IF auth.role() = 'authenticated' THEN
        RAISE EXCEPTION 'Access denied: Retention pruning is restricted to service_role or system administrators.';
    END IF;

    IF retention_days < 90 THEN
        RAISE EXCEPTION 'Safety check failed: Retention window cannot be shorter than 90 days.';
    END IF;

    -- Enable session-scoped maintenance bypass flag
    PERFORM set_config('brandguard.retention_cleanup_active', 'on', true);

    DELETE FROM public.revision_history rh
    WHERE rh.submission_id IN (
        SELECT cs.id FROM public.content_submissions cs WHERE cs.organisation_id = target_org_id
    )
    AND rh.created_at < (TIMEZONE('utc'::text, NOW()) - (retention_days || ' days')::INTERVAL);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Reset session-scoped maintenance bypass flag
    PERFORM set_config('brandguard.retention_cleanup_active', 'off', true);

    RETURN deleted_count;
END;
$$;

-- ==============================================================================
-- 9. FUNCTION ACCESS PRIVILEGES & SECURITY HARDENING
-- ==============================================================================
REVOKE ALL ON FUNCTION public.get_user_org_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_org_ids() TO authenticated;

REVOKE ALL ON FUNCTION public.is_org_member(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.is_org_role(UUID, VARCHAR[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_role(UUID, VARCHAR[]) TO authenticated;

REVOKE ALL ON FUNCTION public.is_org_admin_or_owner(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_admin_or_owner(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.create_organisation(VARCHAR, VARCHAR) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_organisation(VARCHAR, VARCHAR) TO authenticated;

REVOKE ALL ON FUNCTION public.join_demo_organisation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_demo_organisation() TO authenticated;

REVOKE ALL ON FUNCTION public.purge_retention_revisions(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_retention_revisions(UUID, INTEGER) TO service_role;

-- Internal triggers do not require user execution
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_organisation_members_integrity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_submission_ownership() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_submission_brand_consistency() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_no_self_approval() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_revision_history_immutability() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL 14 TABLES
-- ==============================================================================

ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_tone_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_disclaimers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_taglines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_actions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 10.1 organisations
-- ------------------------------------------------------------------------------
CREATE POLICY "org_select" ON public.organisations
    FOR SELECT TO authenticated
    USING (
        id IN (SELECT org_id FROM public.get_user_org_ids())
        OR is_demo = true
    );



CREATE POLICY "org_update" ON public.organisations
    FOR UPDATE TO authenticated
    USING (public.is_org_admin_or_owner(id))
    WITH CHECK (public.is_org_admin_or_owner(id));

CREATE POLICY "org_delete" ON public.organisations
    FOR DELETE TO authenticated
    USING (public.is_org_role(id, ARRAY['owner']::VARCHAR[]) AND is_demo = false);

-- ------------------------------------------------------------------------------
-- 10.2 organisation_members
-- ------------------------------------------------------------------------------
CREATE POLICY "members_select" ON public.organisation_members
    FOR SELECT TO authenticated
    USING (organisation_id IN (SELECT org_id FROM public.get_user_org_ids()));



CREATE POLICY "members_update" ON public.organisation_members
    FOR UPDATE TO authenticated
    USING (public.is_org_admin_or_owner(organisation_id))
    WITH CHECK (public.is_org_admin_or_owner(organisation_id));

CREATE POLICY "members_delete" ON public.organisation_members
    FOR DELETE TO authenticated
    USING (
        public.is_org_admin_or_owner(organisation_id)
        OR user_id = auth.uid()
    );

-- ------------------------------------------------------------------------------
-- 10.3 profiles
-- ------------------------------------------------------------------------------
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        id = auth.uid()
        OR id IN (
            SELECT om.user_id
            FROM public.organisation_members om
            WHERE om.organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
    );

CREATE POLICY "profiles_insert" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_delete" ON public.profiles
    FOR DELETE TO authenticated
    USING (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 10.4 brands
-- ------------------------------------------------------------------------------
CREATE POLICY "brands_select" ON public.brands
    FOR SELECT TO authenticated
    USING (organisation_id IN (SELECT org_id FROM public.get_user_org_ids()));

CREATE POLICY "brands_insert" ON public.brands
    FOR INSERT TO authenticated
    WITH CHECK (public.is_org_admin_or_owner(organisation_id));

CREATE POLICY "brands_update" ON public.brands
    FOR UPDATE TO authenticated
    USING (public.is_org_admin_or_owner(organisation_id))
    WITH CHECK (public.is_org_admin_or_owner(organisation_id));

CREATE POLICY "brands_delete" ON public.brands
    FOR DELETE TO authenticated
    USING (public.is_org_role(organisation_id, ARRAY['owner']::VARCHAR[]));

-- ------------------------------------------------------------------------------
-- 10.5 brand_guidelines
-- ------------------------------------------------------------------------------
CREATE POLICY "guidelines_select" ON public.brand_guidelines
    FOR SELECT TO authenticated
    USING (
        brand_id IN (
            SELECT b.id FROM public.brands b
            WHERE b.organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
    );

CREATE POLICY "guidelines_insert" ON public.brand_guidelines
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands b
            WHERE b.id = brand_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

CREATE POLICY "guidelines_update" ON public.brand_guidelines
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.brands b
            WHERE b.id = brand_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands b
            WHERE b.id = brand_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

CREATE POLICY "guidelines_delete" ON public.brand_guidelines
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.brands b
            WHERE b.id = brand_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

-- ------------------------------------------------------------------------------
-- 10.6 brand_tone_traits
-- ------------------------------------------------------------------------------
CREATE POLICY "tone_select" ON public.brand_tone_traits
    FOR SELECT TO authenticated
    USING (
        guideline_id IN (
            SELECT g.id FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE b.organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
    );

CREATE POLICY "tone_insert" ON public.brand_tone_traits
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

CREATE POLICY "tone_update" ON public.brand_tone_traits
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

CREATE POLICY "tone_delete" ON public.brand_tone_traits
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

-- ------------------------------------------------------------------------------
-- 10.7 brand_disclaimers
-- ------------------------------------------------------------------------------
CREATE POLICY "disclaimers_select" ON public.brand_disclaimers
    FOR SELECT TO authenticated
    USING (
        guideline_id IN (
            SELECT g.id FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE b.organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
    );

CREATE POLICY "disclaimers_insert" ON public.brand_disclaimers
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

CREATE POLICY "disclaimers_update" ON public.brand_disclaimers
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

CREATE POLICY "disclaimers_delete" ON public.brand_disclaimers
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

-- ------------------------------------------------------------------------------
-- 10.8 brand_taglines
-- ------------------------------------------------------------------------------
CREATE POLICY "taglines_select" ON public.brand_taglines
    FOR SELECT TO authenticated
    USING (
        guideline_id IN (
            SELECT g.id FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE b.organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
    );

CREATE POLICY "taglines_insert" ON public.brand_taglines
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

CREATE POLICY "taglines_update" ON public.brand_taglines
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

CREATE POLICY "taglines_delete" ON public.brand_taglines
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

-- ------------------------------------------------------------------------------
-- 10.9 brand_rules
-- ------------------------------------------------------------------------------
CREATE POLICY "rules_select" ON public.brand_rules
    FOR SELECT TO authenticated
    USING (
        guideline_id IN (
            SELECT g.id FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE b.organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
    );

CREATE POLICY "rules_insert" ON public.brand_rules
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

CREATE POLICY "rules_update" ON public.brand_rules
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

CREATE POLICY "rules_delete" ON public.brand_rules
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.brand_guidelines g
            JOIN public.brands b ON b.id = g.brand_id
            WHERE g.id = guideline_id
              AND public.is_org_admin_or_owner(b.organisation_id)
        )
    );

-- ------------------------------------------------------------------------------
-- 10.10 content_submissions
-- ------------------------------------------------------------------------------
CREATE POLICY "submissions_select" ON public.content_submissions
    FOR SELECT TO authenticated
    USING (organisation_id IN (SELECT org_id FROM public.get_user_org_ids()));

CREATE POLICY "submissions_insert" ON public.content_submissions
    FOR INSERT TO authenticated
    WITH CHECK (
        organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        AND (
            author_id = auth.uid()
            OR public.is_org_admin_or_owner(organisation_id)
        )
    );

CREATE POLICY "submissions_update" ON public.content_submissions
    FOR UPDATE TO authenticated
    USING (
        organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        AND (
            (author_id = auth.uid() AND status IN ('submitted', 'needs_revision'))
            OR public.is_org_role(organisation_id, ARRAY['reviewer', 'admin', 'owner']::VARCHAR[])
        )
    )
    WITH CHECK (
        organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        AND (
            (author_id = auth.uid() AND status IN ('submitted', 'needs_revision'))
            OR public.is_org_role(organisation_id, ARRAY['reviewer', 'admin', 'owner']::VARCHAR[])
        )
    );

CREATE POLICY "submissions_delete" ON public.content_submissions
    FOR DELETE TO authenticated
    USING (
        organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        AND (
            (author_id = auth.uid() AND status IN ('submitted', 'needs_revision'))
            OR public.is_org_admin_or_owner(organisation_id)
        )
    );

-- ------------------------------------------------------------------------------
-- 10.11 compliance_reports
-- ------------------------------------------------------------------------------
CREATE POLICY "reports_select" ON public.compliance_reports
    FOR SELECT TO authenticated
    USING (
        submission_id IN (
            SELECT s.id FROM public.content_submissions s
            WHERE s.organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
    );

 




-- ------------------------------------------------------------------------------
-- 10.12 compliance_violations
-- ------------------------------------------------------------------------------
CREATE POLICY "violations_select" ON public.compliance_violations
    FOR SELECT TO authenticated
    USING (
        report_id IN (
            SELECT r.id FROM public.compliance_reports r
            JOIN public.content_submissions s ON s.id = r.submission_id
            WHERE s.organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
    );



CREATE POLICY "violations_update" ON public.compliance_violations
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.compliance_reports r
            JOIN public.content_submissions s
                ON s.id = r.submission_id
            WHERE r.id = report_id
              AND public.is_org_role(
                  s.organisation_id,
                  ARRAY['reviewer', 'admin', 'owner']::VARCHAR[]
              )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.compliance_reports r
            JOIN public.content_submissions s
                ON s.id = r.submission_id
            WHERE r.id = report_id
              AND public.is_org_role(
                  s.organisation_id,
                  ARRAY['reviewer', 'admin', 'owner']::VARCHAR[]
              )
        )
    );

CREATE POLICY "violations_delete" ON public.compliance_violations
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.compliance_reports r
            JOIN public.content_submissions s ON s.id = r.submission_id
            WHERE r.id = report_id
              AND public.is_org_admin_or_owner(s.organisation_id)
        )
    );

-- ------------------------------------------------------------------------------
-- 10.13 revision_history (IMMUTABLE AUDIT LOG - ZERO UPDATE/DELETE POLICIES)
-- ------------------------------------------------------------------------------
CREATE POLICY "revisions_select" ON public.revision_history
    FOR SELECT TO authenticated
    USING (
        submission_id IN (
            SELECT s.id FROM public.content_submissions s
            WHERE s.organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
    );

CREATE POLICY "revisions_insert" ON public.revision_history
    FOR INSERT TO authenticated
    WITH CHECK (
        submission_id IN (
            SELECT s.id FROM public.content_submissions s
            WHERE s.organisation_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
        AND (
            author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.content_submissions s
                WHERE s.id = submission_id
                  AND public.is_org_admin_or_owner(s.organisation_id)
            )
        )
    );

-- Note: In accordance with immutable audit invariants, NO UPDATE OR DELETE POLICIES
-- exist for the authenticated application role. Deletions are only possible via
-- the purge_retention_revisions() RPC restricted strictly to service_role.

-- ------------------------------------------------------------------------------
-- 10.14 review_actions
-- ------------------------------------------------------------------------------
-- ----------------------------------------------------------------
-- 10.14 review_actions
-- ----------------------------------------------------------------

-- Members can view review actions for their organisation
CREATE POLICY "reviews_select" ON public.review_actions
    FOR SELECT TO authenticated
    USING (
        submission_id IN (
            SELECT s.id
            FROM public.content_submissions s
            WHERE s.organisation_id IN (
                SELECT org_id FROM public.get_user_org_ids()
            )
        )
    );

-- Only reviewers, admins and owners can create review actions
CREATE POLICY "reviews_insert" ON public.review_actions
    FOR INSERT TO authenticated
    WITH CHECK (
        reviewer_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.content_submissions s
            WHERE s.id = submission_id
              AND public.is_org_role(
                  s.organisation_id,
                  ARRAY['reviewer', 'admin', 'owner']::VARCHAR[]
              )
        )
    );

-- No UPDATE policy:
-- Review actions are treated as audit records.
-- Add a new action instead of editing an old decision.

-- Only admins and owners can delete review actions


-- ==============================================================================
-- 11. DETERMINISTIC SEED DATA (SAFE FOR FRESH SUPABASE INSTANCES)
-- ==============================================================================
-- Uses known deterministic UUIDs that link relational hierarchies without requiring
-- preexisting records in auth.users (author_id & reviewer_id are NULL in initial seeds).

DO $$
DECLARE
    seed_org_id UUID := 'a0000000-0000-0000-0000-000000000001'::uuid;
    seed_brand_id UUID := 'b0000000-0000-0000-0000-000000000001'::uuid;
    seed_guideline_id UUID := 'c0000000-0000-0000-0000-000000000001'::uuid;
    seed_sub1_id UUID := '20000000-0000-0000-0000-000000000001'::uuid;
    seed_sub2_id UUID := '20000000-0000-0000-0000-000000000002'::uuid;
    seed_sub3_id UUID := '20000000-0000-0000-0000-000000000003'::uuid;
    seed_sub4_id UUID := '20000000-0000-0000-0000-000000000004'::uuid;
    seed_rep1_id UUID := '30000000-0000-0000-0000-000000000001'::uuid;
    seed_rule1_id UUID := '10000000-0000-0000-0000-000000000001'::uuid;
    seed_rule2_id UUID := '10000000-0000-0000-0000-000000000002'::uuid;
    seed_rule3_id UUID := '10000000-0000-0000-0000-000000000003'::uuid;
    seed_rule4_id UUID := '10000000-0000-0000-0000-000000000004'::uuid;
    seed_rule5_id UUID := '10000000-0000-0000-0000-000000000005'::uuid;
BEGIN
    
    IF EXISTS (
        SELECT 1
        FROM public.organisations
        WHERE slug = 'acme-global'
          AND id <> seed_org_id
    ) THEN
        RAISE EXCEPTION
            'Demo organisation slug already exists with a different ID.';
    END IF;
    

    -- 11.1 Seed Demo Organisation
        -- Prevent conflicting demo organisation IDs
    INSERT INTO public.organisations (id, name, slug, is_demo)
    VALUES (seed_org_id, 'Acme Global Cloud Demo', 'acme-global', true)
    ON CONFLICT (slug) DO NOTHING;

    -- 11.2 Seed Demo Brand
    INSERT INTO public.brands (id, organisation_id, name, slug, industry, description, health_score, primary_color)
    VALUES (
        seed_brand_id,
        seed_org_id,
        'Acme Global Cloud',
        'acme-global',
        'Enterprise Cloud & Observability',
        'Mission-critical cloud infrastructure and developer observability platforms.',
        94.20,
        '#8B5CF6'
    )
    ON CONFLICT (organisation_id, slug) DO NOTHING;

    -- 11.3 Seed Demo Brand Guidelines
    INSERT INTO public.brand_guidelines (id, brand_id, name, version, reading_level, is_active)
    VALUES (
        seed_guideline_id,
        seed_brand_id,
        'Acme Global 2026 Core Brand Identity',
        'v2.4',
        'Grade 8 - 10 (Flesch-Kincaid)',
        true
    )
    ON CONFLICT (id) DO NOTHING;

    -- 11.4 Seed Tone Traits
    INSERT INTO public.brand_tone_traits (id, guideline_id, trait, rating, description)
    VALUES
        ('d0000000-0000-0000-0000-000000000001'::uuid, seed_guideline_id, 'Authoritative', 85, 'Direct, expert, data-backed insights without pomposity'),
        ('d0000000-0000-0000-0000-000000000002'::uuid, seed_guideline_id, 'Empathetic', 75, 'Focus on developer pain points and team productivity'),
        ('d0000000-0000-0000-0000-000000000003'::uuid, seed_guideline_id, 'Innovative', 90, 'Forward-looking, clear about technological breakthroughs'),
        ('d0000000-0000-0000-0000-000000000004'::uuid, seed_guideline_id, 'Clarity / Plain Language', 95, 'Zero fluff, active verbs, concise clauses')
    ON CONFLICT (id) DO NOTHING;

    -- 11.5 Seed Disclaimers
    INSERT INTO public.brand_disclaimers (id, guideline_id, channel_or_context, disclaimer_text, is_mandatory)
    VALUES
        ('e0000000-0000-0000-0000-000000000001'::uuid, seed_guideline_id, 'Promotional Email', 'Unsubscribe anytime. Acme Global Cloud is SOC2 Type II and ISO 27001 certified.', true),
        ('e0000000-0000-0000-0000-000000000002'::uuid, seed_guideline_id, 'Benchmark Claims', 'Internal benchmarks measured against v3.2 workloads. Individual customer results may vary.', true)
    ON CONFLICT (id) DO NOTHING;

    -- 11.6 Seed Taglines
    INSERT INTO public.brand_taglines (id, guideline_id, tagline, context_notes, is_primary)
    VALUES
        ('f0000000-0000-0000-0000-000000000001'::uuid, seed_guideline_id, 'Every piece of content. One consistent brand.', 'Global master tagline', true),
        ('f0000000-0000-0000-0000-000000000002'::uuid, seed_guideline_id, 'Infrastructure at the speed of thought.', 'Developer cloud campaign', false),
        ('f0000000-0000-0000-0000-000000000003'::uuid, seed_guideline_id, 'Precision cloud systems for mission-critical teams.', 'Enterprise pitch tagline', false)
    ON CONFLICT (id) DO NOTHING;

    -- 11.7 Seed Rules & Prohibitions
    INSERT INTO public.brand_rules (id, guideline_id, category, rule_name, severity, banned_pattern, preferred_alternative, explanation, is_active)
    VALUES
        (seed_rule1_id, seed_guideline_id, 'terminology', 'Prohibited Buzzwords & Hyperbole', 'warning', 'revolutionary|game-changer', 'transformational catalyst for efficiency', 'Both "revolutionary" and "game-changer" are explicitly banned. Acme brand voice mandates concrete data and architectural precision rather than marketing hype.', true),
        (seed_rule2_id, seed_guideline_id, 'terminology', 'Banned Corporate Jargon', 'warning', 'synergy', 'architectural alignment', '"Synergy" is flagged as vague corporate jargon. State the technical integration reality directly.', true),
        (seed_rule3_id, seed_guideline_id, 'tone', 'Brand Equity Degradation', 'suggestion', 'cheap', 'cost-effective / optimized TCO', 'The word "cheap" degrades perception of engineering value. Guidelines recommend "cost-effective" or "optimized TCO".', true),
        (seed_rule4_id, seed_guideline_id, 'legal', 'Absolute Uptime & Reliability Claims', 'critical', 'guarantees foolproof uptime', 'engineered high-availability backed by 99.99% SLAs', 'Legal policy strictly forbids the phrase "guarantees foolproof uptime" as it conflicts with Master Service Agreement SLA terms (99.99%) and creates breach of warranty exposure.', true),
        (seed_rule5_id, seed_guideline_id, 'formatting', 'Brand Name First Mention', 'suggestion', 'Acme', 'Acme Global Cloud', 'First mention in closing CTA should read "Acme Global Cloud" in full.', true)
    ON CONFLICT (id) DO NOTHING;

    -- 11.8 Seed Submissions
    INSERT INTO public.content_submissions (
        id, organisation_id, brand_id, guideline_id, title, channel, target_audience,
        author_id, author_name, author_role, department, content_body, status,
        current_version, latest_score, word_count
    )
    VALUES
        (
            seed_sub1_id, seed_org_id, seed_brand_id, seed_guideline_id,
            'Enterprise Cloud Migration: 5 Traps to Avoid in 2026',
            'blog',
            'VP of Engineering, Cloud Architects',
            NULL, 'Sarah Jenkins', 'Senior Tech Evangelist', 'Developer Marketing',
            'Migrating legacy enterprise applications to modern distributed cloud infrastructure is often touted as a revolutionary game-changer for cost reduction. However, without rigorous governance, engineering organizations rapidly experience bill shock and architecture drift.' || E'\n\n' ||
            'First, beware of lift-and-shift illusions. Simply porting bare-metal virtual machines into Kubernetes containers without refactoring creates synergy problems between legacy databases and stateless pods. This cheap approach inevitably backfires when auto-scaling triggers unexpected compute spikes.' || E'\n\n' ||
            'Second, ensure end-to-end telemetry is configured before cutover. Acme guarantees foolproof uptime during migrations if telemetry is actively streaming.' || E'\n\n' ||
            'To learn more about how Acme Global can eliminate your technical debt, schedule an engineering consultation today.',
            'needs_revision', 'v1.1', 74.00, 840
        ),
        (
            seed_sub2_id, seed_org_id, seed_brand_id, seed_guideline_id,
            'Q4 Product Showcase & Next-Gen Observability Announcement',
            'social',
            'Software Engineers, DevOps Leads',
            NULL, 'Marcus Vance', 'Product Marketing Manager', 'Growth Marketing',
            'Modern engineering teams should not spend hours diagnosing transient microservices latency. Today, Acme Global Cloud is launching Real-Time Trace Analytics.' || E'\n\n' ||
            'With distributed kernel-level sampling, teams cut mean time to resolution by 42% across multi-region clusters.' || E'\n\n' ||
            'Key enhancements:' || E'\n' ||
            '• Automated root-cause clustering' || E'\n' ||
            '• Zero-overhead telemetry collectors' || E'\n' ||
            '• Direct integration with your incident response stack' || E'\n\n' ||
            'Explore the technical overview and benchmark metrics via the link below.' || E'\n' ||
            'Acme Global Cloud is SOC2 Type II and ISO 27001 certified.',
            'approved', 'v1.2', 96.00, 165
        ),
        (
            seed_sub3_id, seed_org_id, seed_brand_id, seed_guideline_id,
            'Acme Partner Ecosystem Incentive Program Launch',
            'press_release',
            'Industry Analysts, System Integrators',
            NULL, 'Elena Rostova', 'Global PR Director', 'Corporate Communications',
            'SAN FRANCISCO — Acme Global Cloud today announced a $25M co-investment fund dedicated to certifying enterprise systems integrators across North America and EMEA.' || E'\n\n' ||
            'The initiative equips technology partners with direct architectural guidance, specialized migration sandboxes, and dedicated escalation engineering support.' || E'\n\n' ||
            '"Enterprise cloud modernization demands specialized practitioner expertise," stated Jordan Lee, Chief Executive Officer at Acme. "By expanding our verified partner network, we are accelerating reliable modernization outcomes for our joint Fortune 500 customers."',
            'in_review', 'v1.0', 88.00, 520
        ),
        (
            seed_sub4_id, seed_org_id, seed_brand_id, seed_guideline_id,
            'Special Black Friday Enterprise License Discount Blast',
            'email',
            'Self-Serve Tier Developers',
            NULL, 'Dave K.', 'Lifecycle Marketing Specialist', 'Growth Marketing',
            'Do not miss our dirt-cheap annual sale! For 48 hours only, get our revolutionary foolproof cloud cluster for 70% off. It is a guaranteed game-changer for your team. Click now to claim your discount before supplies run out!',
            'needs_revision', 'v1.0', 58.00, 210
        )
    ON CONFLICT (id) DO NOTHING;

    -- 11.9 Seed Compliance Report for sub-101
    INSERT INTO public.compliance_reports (
        id, submission_id, overall_score, grade, verdict,
        tone_score, terminology_score, legal_score, formatting_score,
        summary, suggested_improvements, ai_model_used, execution_time_ms
    )
    VALUES (
        seed_rep1_id, seed_sub1_id, 74.00, 'C+', 'Needs Revision Before Publishing',
        72.00, 65.00, 68.00, 92.00,
        'The article contains multiple prohibited buzzwords ("revolutionary", "game-changer", "cheap"), violates the policy against making unsupported absolute guarantees ("Acme guarantees foolproof uptime"), and omits required benchmark disclaimers.',
        'Replace hyperbole with technical metrics. Reframe uptime SLA claims to align with standard legal warranty terms.',
        'server-secure-llm', 1420
    )
    ON CONFLICT (id) DO NOTHING;

    -- 11.10 Seed Compliance Violations for sub-101
    INSERT INTO public.compliance_violations (
        id, report_id, rule_id, category, severity, flagged_text,
        location_context, issue_description, suggested_fix, status
    )
    VALUES
        ('40000000-0000-0000-0000-000000000001'::uuid, seed_rep1_id, seed_rule1_id, 'terminology', 'warning', 'revolutionary game-changer', 'Paragraph 1, Line 1', 'Both "revolutionary" and "game-changer" are banned buzzwords.', 'transformational catalyst for efficiency', 'open'),
        ('40000000-0000-0000-0000-000000000002'::uuid, seed_rep1_id, seed_rule2_id, 'terminology', 'warning', 'synergy problems', 'Paragraph 2, Line 2', '"Synergy" is flagged as vague corporate jargon.', 'architectural friction between stateful databases and ephemeral pods', 'open'),
        ('40000000-0000-0000-0000-000000000003'::uuid, seed_rep1_id, seed_rule3_id, 'tone', 'suggestion', 'cheap approach', 'Paragraph 2, Line 3', '"Cheap" degrades perception of enterprise engineering rigor.', 'unoptimized tactical approach', 'open'),
        ('40000000-0000-0000-0000-000000000004'::uuid, seed_rep1_id, seed_rule4_id, 'legal', 'critical', 'Acme guarantees foolproof uptime', 'Paragraph 3, Line 1', 'Exposes organisation to breach of warranty liability contrary to SLA terms.', 'Acme provides engineered high-availability architectures backed by 99.99% SLAs', 'open'),
        ('40000000-0000-0000-0000-000000000005'::uuid, seed_rep1_id, seed_rule5_id, 'formatting', 'suggestion', 'Acme Global can eliminate your technical debt', 'Paragraph 4, Line 1', 'First mention in closing CTA should read "Acme Global Cloud" in full.', 'Acme Global Cloud can help your team remediate technical debt', 'open')
    ON CONFLICT (id) DO NOTHING;

    -- 11.11 Seed Revision History
    INSERT INTO public.revision_history (
        id, submission_id, version_tag, author_id, author_name, content_snapshot, change_summary, score_at_revision
    )
    VALUES
        (
            '50000000-0000-0000-0000-000000000001'::uuid, seed_sub1_id, 'v1.0', NULL, 'Sarah Jenkins',
            'Initial draft imported from Markdown files.',
            'Initial import draft.',
            62.00
        ),
        (
            '50000000-0000-0000-0000-000000000002'::uuid, seed_sub1_id, 'v1.1', NULL, 'Sarah Jenkins',
            'Second draft submitted with telemetry section added.',
            'Added telemetry and cutover section.',
            74.00
        )
    ON CONFLICT (id) DO NOTHING;

    -- 11.12 Seed Review Action (Comment)
    INSERT INTO public.review_actions (
        id, submission_id, reviewer_id, reviewer_name, reviewer_role, action_type, comments
    )
    VALUES (
        '60000000-0000-0000-0000-000000000001'::uuid, seed_sub1_id, NULL,
        'Brand Governance Committee', 'Governance Reviewer', 'comment',
        'Please remediate flagged legal SLA language and prohibited hyperbole before requesting final approval.'
    )
    ON CONFLICT (id) DO NOTHING;

END $$;
