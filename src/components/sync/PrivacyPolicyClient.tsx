"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSync } from './SyncProviders';

export default function PrivacyPolicyClient() {
  const { lang } = useSync();

  const isAr = lang === 'ar';

  const content = {
    title: isAr ? "شروط الاستخدام وسياسة الخصوصية" : "Terms of Use and Privacy Policy",
    lastUpdated: isAr ? "تاريخ آخر تحديث: مايو 2026" : "Last Updated: May 2026",
    intro: isAr 
      ? "مرحباً بك في منصة Sync. باستخدامك لهذا الموقع وخدماته، فإنك توافق على جميع الشروط والسياسات المذكورة أدناه. يُرجى قراءة هذه السياسات بعناية قبل إتمام أي عملية شراء أو استخدام أي من خدماتنا."
      : "Welcome to Sync. By using this website and its services, you agree to all the terms and policies stated below. Please read these policies carefully before making any purchase or using any of our services.",
    sections: [
      {
        title: isAr ? "طبيعة المنتجات والخدمات" : "Nature of Products and Services",
        text: isAr ? [
          "جميع المنتجات والحسابات المعروضة على منصة Sync (مثل اشتراكات Google Gemini Pro وأدوات الذكاء الاصطناعي الأخرى) هي منتجات رقمية أصلية وجديدة تماماً. يتم توفير جميع الحسابات والاشتراكات من خلال العروض الترويجية الرسمية المقدمة من الشركات الأم.",
          "لا يوجد أي منتج تم الحصول عليه عبر الاختراق، السرقة، الاحتيال، أو أي وسائل غير قانونية. جميع المنتجات تم الحصول عليها بطرق شرعية وقانونية بالكامل، وبما يتوافق مع شروط استخدام المنصات الأصلية."
        ] : [
          "All products and accounts offered on the Sync platform (such as Google Gemini Pro subscriptions and other AI tools) are 100% genuine and brand new digital products. All accounts and subscriptions are provided through official promotional offers from parent companies.",
          "No product is obtained through hacking, theft, fraud, or any illegal means. All products are obtained in fully legitimate and legal ways, in accordance with the terms of use of the original platforms."
        ],
      },
      {
        title: isAr ? "مصادر الحسابات والاشتراكات" : "Sources of Accounts and Subscriptions",
        text: isAr ? [
          "نحن في Sync نحصل على منتجاتنا حصرياً من المصادر التالية:"
        ] : [
          "At Sync, we source our products exclusively from the following:"
        ],
        list: isAr ? [
          "العروض الترويجية الرسمية والباقات المخفضة من الشركات المطورة.",
          "برامج الشراكة والتوزيع المعتمدة.",
          "التراخيص الجماعية (Volume Licenses) المرخصة رسمياً.",
          "العروض الموسمية والحملات التسويقية الرسمية."
        ] : [
          "Official promotional offers and discounted packages from developers.",
          "Approved partnership and distribution programs.",
          "Officially licensed Volume Licenses.",
          "Official seasonal offers and marketing campaigns."
        ],
        postText: isAr 
          ? "نحن ملتزمون تماماً بالامتثال لكافة القوانين واللوائح المعمول بها في مجال التجارة الإلكترونية والمنتجات الرقمية."
          : "We are fully committed to complying with all applicable laws and regulations in the field of e-commerce and digital products."
      },
      {
        title: isAr ? "إخلاء المسؤولية عن الاستخدام" : "Disclaimer of Use",
        text: isAr ? [
          "تُخلي منصة Sync مسؤوليتها الكاملة عن أي استخدام غير قانوني أو غير مشروع من قِبل المستخدم للمنتجات المشتراة. يتحمل المستخدم وحده المسؤولية الكاملة عن:"
        ] : [
          "Sync disclaims all responsibility for any illegal or unlawful use by the user of the purchased products. The user bears sole and full responsibility for:"
        ],
        list: isAr ? [
          "كيفية استخدام المنتج أو الحساب أو أدوات الذكاء الاصطناعي بعد الشراء.",
          "أي انتهاك لشروط الاستخدام الخاصة بالمنصات الأصلية (مثل سياسات Google).",
          "أي نشاط غير قانوني يتم من خلال الحسابات المشتراة.",
          "أي ضرر ناتج عن سوء الاستخدام أو الإهمال، مثل مشاركة بيانات الحساب مع جهات غير موثوقة."
        ] : [
          "How the product, account, or AI tools are used after purchase.",
          "Any violation of the terms of use of the original platforms (e.g., Google policies).",
          "Any illegal activity conducted through the purchased accounts.",
          "Any damage resulting from misuse or negligence, such as sharing account details with untrustworthy parties."
        ],
        postText: isAr 
          ? "بمجرد اكتمال عملية الشراء وتسليم المنتج، تنتقل المسؤولية الكاملة إلى المشتري."
          : "Once the purchase is completed and the product is delivered, full responsibility transfers to the buyer."
      },
      {
        title: isAr ? "سياسة الاسترجاع (Refund & Return Policy)" : "Refund & Return Policy",
        text: isAr ? [
          "يحق للمستخدمين طلب استرداد الأموال في الحالات التالية فقط:"
        ] : [
          "Users have the right to request a refund only in the following cases:"
        ],
        list: isAr ? [
          "عدم تسليم المنتج خلال الوقت المحدد والمتفق عليه.",
          "تسليم منتج مختلف عن المنتج الذي تم طلبه.",
          "وجود مشكلة فنية أساسية في الحساب تمنع استخدامه تماماً عند التسليم."
        ] : [
          "Failure to deliver the product within the specified and agreed-upon timeframe.",
          "Delivery of a product different from what was ordered.",
          "A fundamental technical issue in the account that completely prevents its use upon delivery."
        ],
        text2: isAr ? "لا تتوفر خدمة الاسترجاع في الحالات التالية:" : "The refund service is NOT available in the following cases:",
        list2: isAr ? [
          "بعد استخدام المنتج أو تفعيل الحساب بشكل سليم.",
          "تغيير الرأي بعد إتمام عملية التسليم.",
          "المشاكل الناتجة عن سوء استخدام المشتري أو حظر الحساب بسبب مخالفته لسياسات الشركة الأم."
        ] : [
          "After using the product or activating the account successfully.",
          "Changing your mind after the delivery process is completed.",
          "Issues resulting from buyer misuse or account bans due to violating the parent company's policies."
        ]
      },
      {
        title: isAr ? "حماية البيانات والخصوصية" : "Data Protection and Privacy",
        text: isAr ? [
          "نحن نتعامل مع بيانات المستخدمين بسرية تامة ولا نشاركها مع أي طرف ثالث. نحن لا نقوم بتخزين معلومات الدفع الحساسة؛ حيث تتم جميع المعاملات المالية عبر بوابات دفع آمنة ومعتمدة.",
          "نحن نحتفظ فقط بالبيانات الضرورية لإكمال المعاملات وتقديم الدعم الفني. يحق للمستخدمين المطالبة بحذف بياناتهم من منصتنا في أي وقت."
        ] : [
          "We treat user data with strict confidentiality and do not share it with any third party. We do not store sensitive payment information; all financial transactions are processed through secure and certified payment gateways.",
          "We only retain the data necessary to complete transactions and provide technical support. Users have the right to request the deletion of their data from our platform at any time."
        ]
      },
      {
        title: isAr ? "التزامنا القانوني" : "Our Legal Commitment",
        text: isAr ? [
          "تعمل منصة Sync وفقاً للقوانين واللوائح المعمول بها، ونحن ملتزمون بـ:"
        ] : [
          "Sync operates in accordance with applicable laws and regulations, and we are committed to:"
        ],
        list: isAr ? [
          "الشفافية التامة في جميع المعاملات.",
          "توفير منتجات أصلية وشرعية فقط.",
          "حماية حقوق المستخدمين والعملاء.",
          "التعاون مع الجهات المختصة عند الضرورة.",
          "التحديث المستمر لسياساتنا لضمان الامتثال القانوني."
        ] : [
          "Full transparency in all transactions.",
          "Providing only genuine and legitimate products.",
          "Protecting the rights of users and customers.",
          "Cooperating with competent authorities when necessary.",
          "Continuously updating our policies to ensure legal compliance."
        ],
        highlight: isAr 
          ? "أي انتهاك لهذه السياسات من قِبل المستخدم قد يؤدي إلى تعليق حسابه أو حظره نهائياً من استخدام المنصة."
          : "Any violation of these policies by the user may result in the suspension or permanent ban of their account from using the platform."
      },
      {
        title: isAr ? "سياسة التعويضات واسترداد الأموال (الرصيد)" : "Compensation and Refund Policy (Balance)",
        text: isAr ? [
          "في حال واجهت أي مشكلة مشروعة في الحساب المشترى تستدعي التعويض، يُرجى ملاحظة الآتي:"
        ] : [
          "If you encounter any legitimate issue with a purchased account that warrants compensation, please note the following:"
        ],
        list: isAr ? [
          "لا يتم استرداد الأموال إلى حسابك البنكي أو بطاقتك الائتمانية أو محفظتك الإلكترونية الخارجية. يتم إضافة مبالغ الاسترداد حصرياً إلى \"رصيد حسابك\" (Wallet Balance) داخل منصة Sync لتتمكن من استخدامها في عمليات شراء مستقبلية.",
          "مبالغ الاسترداد ليست بالضرورة استرداداً كاملاً (Full Refund). يتم تقدير قيمة المبلغ المسترد بناءً على المدة التي استخدم فيها العميل الحساب قبل حدوث المشكلة. كلما زادت مدة الاستخدام، قل مبلغ التعويض المتاح.",
          "تحتفظ إدارة المنصة بالحق في تقدير مبلغ التعويض المناسب لكل حالة على حدة.",
          "لا يحق للعميل المطالبة باسترداد كامل المبلغ إذا تم استخدام الحساب لأي فترة زمنية."
        ] : [
          "Refunds are not issued to your bank account, credit card, or external e-wallet. Refund amounts are added exclusively to your \"Wallet Balance\" within the Sync platform so you can use them for future purchases.",
          "Refund amounts are not necessarily a full refund. The refunded value is estimated based on the duration the customer used the account before the issue occurred. The longer the usage duration, the lower the available compensation amount.",
          "Platform management reserves the right to determine the appropriate compensation amount on a case-by-case basis.",
          "The customer is not entitled to claim a full refund if the account has been used for any period of time."
        ]
      }
    ]
  };

  return (
    <div className={`min-h-screen bg-(--sync-bg) text-(--sync-text-primary) pt-32 pb-24 px-4 sm:px-6 lg:px-8 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-(--sync-text-dim) hover:text-(--sync-yellow) transition-colors mb-12"
        >
          {isAr ? <ArrowLeft className="w-5 h-5 shrink-0" /> : <ArrowRight className="w-5 h-5 shrink-0 rotate-180" />}
          <span>{isAr ? "العودة للصفحة الرئيسية" : "Back to Home"}</span>
        </Link>

        <div className="bg-(--sync-surface) border border-(--sync-border) rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative element */}
          <div className={`absolute top-0 ${isAr ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} w-64 h-64 bg-(--sync-yellow) opacity-5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none`}></div>

          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-(--sync-border)">
            <div className="w-16 h-16 rounded-2xl bg-(--sync-yellow)/10 flex items-center justify-center border border-(--sync-yellow)/20 shrink-0">
              <ShieldCheck className="w-8 h-8 text-(--sync-yellow)" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{content.title}</h1>
              <p className="text-(--sync-text-dim)">{content.lastUpdated}</p>
            </div>
          </div>

          <div className="space-y-10 text-lg leading-relaxed text-gray-300">
            <section>
              <p className="mb-6">
                {isAr ? (
                  <>
                    مرحباً بك في منصة <strong className="text-white">Sync</strong>. باستخدامك لهذا الموقع وخدماته، فإنك توافق على جميع الشروط والسياسات المذكورة أدناه. يُرجى قراءة هذه السياسات بعناية قبل إتمام أي عملية شراء أو استخدام أي من خدماتنا.
                  </>
                ) : (
                  <>
                    Welcome to <strong className="text-white">Sync</strong>. By using this website and its services, you agree to all the terms and policies stated below. Please read these policies carefully before making any purchase or using any of our services.
                  </>
                )}
              </p>
            </section>

            {content.sections.map((section, idx) => (
              <section key={idx}>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-(--sync-border) flex items-center justify-center text-sm shrink-0">{idx + 1}</span>
                  {section.title}
                </h2>
                
                {section.text.map((p, i) => (
                  <p key={i} className="mb-4">{p}</p>
                ))}
                
                {section.list && (
                  <ul className={`list-disc list-inside space-y-2 text-(--sync-text-dim) ${isAr ? 'pr-4' : 'pl-4'} mb-4`}>
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                
                {section.postText && (
                  <p className="mb-4">{section.postText}</p>
                )}

                {section.text2 && (
                  <p className="mb-4 text-white">{section.text2}</p>
                )}

                {section.list2 && (
                  <ul className={`list-disc list-inside space-y-2 text-(--sync-text-dim) ${isAr ? 'pr-4' : 'pl-4'} mb-4`}>
                    {section.list2.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.highlight && (
                  <p className="text-(--sync-yellow) bg-(--sync-yellow)/10 p-4 rounded-xl border border-(--sync-yellow)/20 mt-4">
                    {section.highlight}
                  </p>
                )}
              </section>
            ))}

            <div className="mt-12 pt-8 border-t border-(--sync-border) text-center">
              <p className="text-white font-medium mb-2">{isAr ? "للاستفسارات المتعلقة بالسياسات:" : "For policy-related inquiries:"}</p>
              <a href="mailto:support@chameleon.vision" className="text-(--sync-yellow) hover:underline text-xl font-mono" dir="ltr">
                support@chameleon.vision
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
