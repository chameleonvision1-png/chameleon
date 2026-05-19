import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse .env.local manually
const envContent = readFileSync('.env.local', 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  envVars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const supabaseUrl = envVars['NEXT_PUBLIC_SYNC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SYNC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  // Get product
  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, cover_image_url')
    .eq('slug', 'xai-super-grok')
    .single();
  console.log('Product:', JSON.stringify(product, null, 2));

  if (product) {
    // Get plans
    const { data: plans } = await supabase
      .from('plans')
      .select('title_en, mini_card_url')
      .eq('product_id', product.id);
    console.log('Plans:', JSON.stringify(plans, null, 2));
  }
}

check();
