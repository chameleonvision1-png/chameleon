ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS mini_card_url text;

CREATE TABLE IF NOT EXISTS public.exchange_rates (
  currency_code text PRIMARY KEY,
  rate_to_usd numeric NOT NULL,
  label text,
  symbol text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.exchange_rates;
DROP POLICY IF EXISTS "Enable ALL for admins only" ON public.exchange_rates;

CREATE POLICY "Enable read access for all users" ON public.exchange_rates FOR SELECT USING (true);
CREATE POLICY "Enable ALL for admins only" ON public.exchange_rates FOR ALL USING (public.is_admin());

INSERT INTO public.exchange_rates (currency_code, rate_to_usd, label, symbol) 
VALUES 
('EGP', 50.8, 'EGP (ج.م)', 'EGP'),
('SAR', 3.75, 'SAR (ر.س)', 'SAR'),
('AED', 3.67, 'AED (د.إ)', 'AED'),
('EUR', 0.92, 'EUR (€)', '€')
ON CONFLICT (currency_code) DO NOTHING;
