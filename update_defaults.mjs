import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SYNC_SUPABASE_URL, process.env.NEXT_PUBLIC_SYNC_SUPABASE_ANON_KEY);

const default_policies_en = `⚠️ **Sync Platform Terms & Conditions**:
- All products and accounts offered are 100% genuine and brand new digital products.
- Sync disclaims all responsibility for any illegal use or violation of the parent company's policies after purchase.
- Refunds are only available in the event of a fundamental technical issue upon delivery that prevents account usage.
- Refund amounts are added exclusively to your "Wallet Balance" within the Sync platform.`;

const default_policies_ar = `⚠️ **شروط وأحكام منصة Sync**:
- جميع المنتجات والحسابات المعروضة هي منتجات رقمية أصلية وجديدة تماماً.
- تُخلي منصة Sync مسؤوليتها الكاملة عن أي استخدام غير قانوني أو انتهاك لسياسات المنصة الأصلية بعد تسليم الحساب.
- يحق للمستخدم طلب استرداد الأموال فقط في حالة وجود مشكلة فنية أساسية عند التسليم تمنع استخدام الحساب.
- لا يتم استرداد الأموال للبطاقة البنكية، بل يتم إضافتها حصرياً إلى "رصيد حسابك" (Wallet Balance) داخل منصة Sync.`;

async function updateDefaultPolicies() {
  // Fetch all plans that do NOT have custom policies set
  const { data: plans, error: fetchError } = await supabase
    .from('plans')
    .select('id, custom_policies_en')
    .is('custom_policies_en', null);

  if (fetchError) {
    console.error('Fetch Error:', fetchError);
    return;
  }

  console.log(`Found ${plans.length} plans missing custom policies. Updating them with default Sync policies...`);

  for (const plan of plans) {
    const { error: updateError } = await supabase
      .from('plans')
      .update({
        custom_policies_en: default_policies_en,
        custom_policies_ar: default_policies_ar
      })
      .eq('id', plan.id);

    if (updateError) {
      console.error('Update Error for plan ID:', plan.id, updateError);
    }
  }

  console.log('Update complete!');
}

updateDefaultPolicies();
