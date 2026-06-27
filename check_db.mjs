import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SYNC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SYNC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: plans, error: planError } = await supabase
    .from('plans')
    .select('id, title_en, price_usd, original_price_usd, product_id, products(name)')
    .order('product_id');
  
  if (planError) {
    console.error(planError);
    return;
  }
  console.log("Current plans in database:", plans);
}

check();
