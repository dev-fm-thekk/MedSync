-- MedSync: three tables (profiles, appointments, access_grants)
-- Profile id = wallet address (lowercase)

-- 1) Enum for user role
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('patient', 'doctor');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Profiles (id = wallet address)
CREATE TABLE IF NOT EXISTS public.profiles (
  id text NOT NULL,
  role public.user_role NOT NULL DEFAULT 'patient'::public.user_role,
  full_name text NULL,
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 3) Appointments (doctor_id and patient_id = wallet addresses / profile ids)
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  doctor_id text NOT NULL,
  patient_id text NOT NULL,
  doctor_name text NULL,
  patient_name text NULL,
  slot_number text NOT NULL,
  appointment_date date NULL,
  appointment_time text NULL,
  status text NOT NULL DEFAULT 'pending',
  access_granted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 4) Access grants (when patient grants doctor access to a token; for audit)
CREATE TABLE IF NOT EXISTS public.access_grants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  token_id text NOT NULL,
  patient_id text NOT NULL,
  doctor_id text NOT NULL,
  doctor_name text NULL,
  expiry_at timestamp with time zone NULL,
  tx_hash text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT access_grants_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Optional: index for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments (doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_patient_id ON public.access_grants (patient_id);
