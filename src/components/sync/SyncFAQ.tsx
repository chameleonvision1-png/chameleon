"use client";

import React, { useState } from 'react';
import { useSync } from './SyncProviders';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SyncFAQ() {
  const { t, lang } = useSync();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: lang === 'en' ? "How do I get my account details?" : "إزاي بستلم بيانات حسابي؟",
      a: lang === 'en' ? "Once you purchase a subscription, our team will contact you within minutes to provide your official login credentials." : "بمجرد إتمام الشراء، فريقنا بيتواصل معاك في دقايق ويبعتلك بيانات الدخول الرسمية للحساب."
    },
    {
      q: lang === 'en' ? "Are these accounts official?" : "هل الحسابات دي رسمية؟",
      a: lang === 'en' ? "Yes, 100%. We provide access to official, fully functional premium accounts with no hidden limitations." : "أيوة 100%. إحنا بنوفر وصول لحسابات بريميوم رسمية وشغالة بالكامل بدون أي قيود مخفية."
    },
    {
      q: lang === 'en' ? "Can I change my plan later?" : "أقدر أغير خطتي بعدين؟",
      a: lang === 'en' ? "Absolutely. You can upgrade or extend your subscription at any time by contacting our support team." : "أكيد. تقدر ترقي حسابك أو تمدد اشتراكك في أي وقت من خلال التواصل مع الدعم الفني."
    },
    {
      q: lang === 'en' ? "What happens if I face an issue?" : "إيه اللي يحصل لو واجهتني مشكلة؟",
      a: lang === 'en' ? "We offer 24/7 support. Just drop us a message and we will resolve your issue immediately or provide a replacement." : "إحنا بنوفر دعم فني على مدار الساعة. ابعتلنا رسالة وهنحل المشكلة فوراً أو نوفرلك حساب بديل."
    }
  ];

  return (
    <section id="faq" className="py-24 relative z-10" style={{ background: 'var(--sync-bg-elevated)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="sync-heading text-4xl md:text-5xl text-center mb-16">{t.navFAQ}</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl overflow-hidden transition-all duration-300" style={{ background: 'var(--sync-surface)', border: '1px solid var(--sync-border)' }}>
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none"
              >
                <span className="text-lg font-bold" style={{ color: 'var(--sync-text-primary)' }}>{faq.q}</span>
                {openIndex === i ? (
                  <ChevronUp className="w-5 h-5 shrink-0" style={{ color: 'var(--sync-yellow)' }} />
                ) : (
                  <ChevronDown className="w-5 h-5 shrink-0" style={{ color: 'var(--sync-yellow)' }} />
                )}
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-base opacity-70 leading-relaxed" style={{ color: 'var(--sync-text-primary)' }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
