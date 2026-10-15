-- ========================================================================
-- Virtual Number – Complete Supabase Backend Setup Script
-- Author: @Sandeep Sah | Product: Virtual Number
-- 
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/fvigiqxgupovpxaiuqjw
-- 2. Go to the "SQL Editor" tab on the left sidebar.
-- 3. Click "New query", paste this entire script, and click "Run".
-- ========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================================
-- 1. PROFILES TABLE (Linked with Supabase Auth auth.users)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 2. VIRTUAL NUMBERS TABLE
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.virtual_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL CHECK (country IN ('IN', 'US')),
  provider_ref TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'active', 'expired')),
  price NUMERIC NOT NULL DEFAULT 150,
  currency TEXT NOT NULL DEFAULT 'INR',
  reserved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reserved_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 3. ORDERS TABLE
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number_id UUID NOT NULL REFERENCES public.virtual_numbers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  gateway TEXT NOT NULL DEFAULT 'razorpay',
  gateway_order_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 4. PAYMENTS TABLE
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL DEFAULT 'razorpay',
  method TEXT CHECK (method IN ('upi', 'card', 'netbanking', 'wallet')),
  transaction_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 5. SUBSCRIPTIONS TABLE
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number_id UUID NOT NULL REFERENCES public.virtual_numbers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 6. MESSAGES TABLE (SMS, OTP, Calls for Inbox)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number_id UUID NOT NULL REFERENCES public.virtual_numbers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sms', 'otp', 'call')),
  sender TEXT,
  body TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- ========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ========================================================================
CREATE INDEX IF NOT EXISTS idx_virtual_numbers_country_status ON public.virtual_numbers(country, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_number ON public.messages(number_id);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to ensure clean idempotent run
DROP POLICY IF EXISTS "Public virtual numbers read" ON public.virtual_numbers;
DROP POLICY IF EXISTS "Auth users update virtual numbers" ON public.virtual_numbers;
DROP POLICY IF EXISTS "Service role full numbers" ON public.virtual_numbers;
DROP POLICY IF EXISTS "Public can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;

-- 1. Virtual Numbers policies: Anyone can view available/reserved numbers
CREATE POLICY "Public virtual numbers read"
  ON public.virtual_numbers FOR SELECT
  USING (true);

-- Allow authenticated users to reserve numbers and update status on purchase
CREATE POLICY "Auth users update virtual numbers"
  ON public.virtual_numbers FOR UPDATE
  USING (true);

-- Allow inserting numbers (for admin / seeding)
CREATE POLICY "Service role full numbers"
  ON public.virtual_numbers FOR INSERT
  WITH CHECK (true);

-- 2. Profiles policies
CREATE POLICY "Public can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Orders policies
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Payments policies
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Messages policies
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.number_id = public.messages.number_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

-- ========================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER (auth.users -> public.profiles)
-- ========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger hook
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================================
-- SEED DATA: Curated Indian Numbers (₹150 / 30 Days) & US Numbers ($250 / 30 Days)
-- ========================================================================
INSERT INTO public.virtual_numbers (id, number, country, provider_ref, status, price, currency)
VALUES
  -- Indian Numbers
  ('a1000000-0000-0000-0000-000000000001', '+91 98201 44521', 'IN', 'airtel_mum_01', 'available', 150, 'INR'),
  ('a1000000-0000-0000-0000-000000000002', '+91 97112 88390', 'IN', 'jio_del_02',    'available', 150, 'INR'),
  ('a1000000-0000-0000-0000-000000000003', '+91 99881 77623', 'IN', 'airtel_blr_03', 'available', 150, 'INR'),
  ('a1000000-0000-0000-0000-000000000004', '+91 98450 33198', 'IN', 'vi_hyd_04',     'available', 150, 'INR'),
  ('a1000000-0000-0000-0000-000000000005', '+91 98100 55432', 'IN', 'jio_pun_05',    'available', 150, 'INR'),
  ('a1000000-0000-0000-0000-000000000006', '+91 98765 12345', 'IN', 'airtel_chn_06', 'available', 150, 'INR'),
  ('a1000000-0000-0000-0000-000000000007', '+91 98234 56789', 'IN', 'jio_kol_07',    'available', 150, 'INR'),
  ('a1000000-0000-0000-0000-000000000008', '+91 99012 34567', 'IN', 'vi_ahm_08',     'available', 150, 'INR'),
  ('a1000000-0000-0000-0000-000000000009', '+91 98198 76543', 'IN', 'airtel_jpr_09', 'available', 150, 'INR'),
  ('a1000000-0000-0000-0000-000000000010', '+91 97654 32109', 'IN', 'jio_luc_10',    'available', 150, 'INR'),

  -- US Numbers
  ('b1000000-0000-0000-0000-000000000001', '+1 (202) 555-0143', 'US', 'tw_wdc_01', 'available', 250, 'USD'),
  ('b1000000-0000-0000-0000-000000000002', '+1 (415) 555-0198', 'US', 'tw_sfo_02', 'available', 250, 'USD'),
  ('b1000000-0000-0000-0000-000000000003', '+1 (646) 555-0172', 'US', 'tw_nyc_03', 'available', 250, 'USD'),
  ('b1000000-0000-0000-0000-000000000004', '+1 (312) 555-0189', 'US', 'tw_chi_04', 'available', 250, 'USD'),
  ('b1000000-0000-0000-0000-000000000005', '+1 (213) 555-0164', 'US', 'tw_lax_05', 'available', 250, 'USD'),
  ('b1000000-0000-0000-0000-000000000006', '+1 (512) 555-0128', 'US', 'tw_atx_06', 'available', 250, 'USD'),
  ('b1000000-0000-0000-0000-000000000007', '+1 (206) 555-0155', 'US', 'tw_sea_07', 'available', 250, 'USD'),
  ('b1000000-0000-0000-0000-000000000008', '+1 (305) 555-0119', 'US', 'tw_mia_08', 'available', 250, 'USD')
ON CONFLICT (number) DO NOTHING;

-- Confirmation output
SELECT count(*) AS total_virtual_numbers FROM public.virtual_numbers;
