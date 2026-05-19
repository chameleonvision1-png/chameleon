import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SYNC_SUPABASE_URL, process.env.NEXT_PUBLIC_SYNC_SUPABASE_ANON_KEY);

const custom_activation_en = `**Format**: Gmail | Password | 2FA | Phone number | SMSLinkCode
- Sign in using Google Authenticator option.
- To get the 6-digit authentication code, copy the 32-character string in the invoice and paste it into the 2fa.live page to get the login code.
- If you must verify the code via phone number, click send code. At the code entry step, please access the SMSLinkCode link in the invoice to get the login authentication code.`;

const custom_activation_ar = `**التنسيق**: ايميل | باسوورد | 2FA | رقم موبايل | رابط كود التفعيل
- قم بتسجيل الدخول باستخدام خيار مصادقة جوجل (Google Authenticator).
- للحصول على رمز المصادقة المكون من 6 أرقام، انسخ النص المكون من 32 حرفاً الموجود في تفاصيل الطلب والصقه في صفحة 2fa.live للحصول على كود الدخول.
- إذا طُلب منك إثبات الهوية برقم الموبايل، اضغط على إرسال الرمز، ثم افتح رابط SMSLinkCode الموجود في تفاصيل طلبك للحصول على كود المصادقة المطلوب للدخول.`;

const custom_policies_en = `⚠️ **Note**: 
- Login warranty only within 12 hours of purchasing an account.
- After successful login, no warranty. 
- After successfully logging in, change the 2-factor authentication to secure information. Passwords and phone numbers should only be changed 3-7 days after logging in to minimize account locking.

Please read carefully and consider carefully before purchasing. Thank you.`;

const custom_policies_ar = `⚠️ **ملاحظة هامة**:
- الضمان يغطي تسجيل الدخول فقط خلال 12 ساعة من شراء الحساب.
- لا يوجد ضمان بعد تسجيل الدخول بنجاح.
- بعد تسجيل الدخول بنجاح، يجب تغيير المصادقة الثنائية (2FA) لضمان أمان حسابك. يُرجى تغيير الباسوورد ورقم الموبايل فقط بعد مرور 3 إلى 7 أيام من تسجيل الدخول لتقليل احتمالية حظر الحساب.

يُرجى قراءة هذه الشروط بعناية قبل الشراء. شكراً لك.`;

async function updatePlans() {
  // Assuming these are Gemini tools that the user is talking about
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', '%gemini%');

  if (productError || !products || products.length === 0) {
    console.error('Product fetch error:', productError);
    return;
  }

  const productIds = products.map(p => p.id);

  const { data: plans, error: fetchError } = await supabase
    .from('plans')
    .select('id, duration_days, product_id')
    .in('product_id', productIds)
    .in('duration_days', [365, 540]);

  if (fetchError) {
    console.error('Fetch Error:', fetchError);
    return;
  }

  console.log('Found Plans to update:', plans);

  for (const plan of plans) {
    const { error: updateError } = await supabase
      .from('plans')
      .update({
        custom_activation_en,
        custom_activation_ar,
        custom_policies_en,
        custom_policies_ar
      })
      .eq('id', plan.id);

    if (updateError) {
      console.error('Update Error for', plan.name_en, updateError);
    } else {
      console.log('Successfully updated:', plan.name_en);
    }
  }
}

updatePlans();
