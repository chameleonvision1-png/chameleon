import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SYNC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SYNC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required env vars: NEXT_PUBLIC_SYNC_SUPABASE_URL and/or NEXT_PUBLIC_SYNC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('plans')
    .select('id, title_en, custom_policies_en, custom_activation_en')
    .limit(5);
  console.log("Error:", error);
  console.log("Data:", data);
}

check();
