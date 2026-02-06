-- One-time migration for testimonials data and schema alignment
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  event text,
  quote text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE testimonials
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Compatibility path if an older schema has "active" instead of "is_active"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'testimonials'
      AND column_name = 'active'
  ) THEN
    EXECUTE 'UPDATE testimonials SET is_active = COALESCE(is_active, active)';
  END IF;
END $$;

INSERT INTO testimonials (name, event, quote, rating, is_active)
SELECT *
FROM (
  VALUES
    ('Sarah Chen', 'Corporate Event', 'BBQAffair made our company party absolutely amazing! The food was delicious and the service was top-notch.', 5, true),
    ('Michael Tan', 'Family Gathering', 'Best BBQ catering we''ve ever had. The lamb chops were cooked to perfection. Will definitely order again!', 5, true),
    ('Jennifer Lim', 'Birthday Party', 'Professional team, great food, hassle-free experience. Highly recommended for any event!', 5, true)
) AS seed(name, event, quote, rating, is_active)
WHERE NOT EXISTS (
  SELECT 1
  FROM testimonials t
  WHERE t.name = seed.name
    AND COALESCE(t.event, '') = COALESCE(seed.event, '')
    AND t.quote = seed.quote
);
