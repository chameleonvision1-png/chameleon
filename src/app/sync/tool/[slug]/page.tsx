"use client";

import React from 'react';
import { useSync } from '@/components/sync/SyncProviders';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bot, MessageSquare, Image as ImageIcon, Sparkles, Palette, Music, CheckCircle, Info, FileText, Settings, CreditCard, HelpCircle, X } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1, label: 'USD ($)' },
  { code: 'EGP', symbol: 'EGP', rate: 50.8, label: 'EGP (ج.م)' },
  { code: 'SAR', symbol: 'SAR', rate: 3.75, label: 'SAR (ر.س)' },
  { code: 'AED', symbol: 'AED', rate: 3.67, label: 'AED (د.إ)' },
  { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
];

const TOOLS_DATA: Record<string, any> = {
  chatgpt: {
    name: 'ChatGPT Plus',
    icon: MessageSquare,
    image: '/sync-covers/chatgpt.png',
    descEn: 'Advanced AI assistant powered by OpenAI\'s latest models.',
    descAr: 'مساعد الذكاء الاصطناعي المتقدم والمدعوم بأحدث نماذج OpenAI.',
    plans: [
      { id: '1', title: '100-Day Access', price: '$8', original: '$20', duration: '/mo', highlight: false, features: ['GPT-4 & GPT-4o Access', 'DALL-E 3 Image Generation', 'Advanced Data Analysis'] },
      { id: '2', title: '1-Year Access', price: '$7', original: '$20', duration: '/mo', highlight: true, features: ['GPT-4 & GPT-4o Access', 'DALL-E 3 Image Generation', 'Advanced Data Analysis', 'Priority Support'] },
    ]
  },
  gemini: {
    name: 'Gemini Advanced',
    icon: Bot,
    image: '/sync-covers/gemini.png',
    descEn: 'Google\'s most capable AI model for highly complex tasks.',
    descAr: 'نموذج الذكاء الاصطناعي الأقوى من جوجل للمهام شديدة التعقيد.',
    plans: [
      { id: '1', title: '365-Day Access', price: '$9.69', original: '$196.96', duration: '', highlight: false, discount: '95% OFF', cardStyle: 'gold', features: ['Advanced AI Models', 'Smart Automations', 'Creative AI Tools', 'Massive Cloud Storage'] },
      { id: '2', title: '18-Month Access', price: '$16.96', original: '$369.00', duration: '', highlight: true, discount: '98% OFF', cardStyle: 'gold', features: ['Advanced AI Models', 'Smart Automations', 'Creative AI Tools', 'Massive Cloud Storage', 'Priority Access'] },
      { id: '3', title: '100-Day Access', price: '$6.96', original: '$69.00', duration: '', highlight: false, discount: '90% OFF', cardStyle: 'blue', features: ['Advanced AI Models', 'Smart Automations', 'Creative AI Tools', 'Massive Cloud Storage'] },
    ]
  },
  midjourney: {
    name: 'Midjourney Pro',
    icon: ImageIcon,
    image: '/sync-covers/midjourney.png',
    descEn: 'Industry-leading AI image generation from text descriptions.',
    descAr: 'توليد الصور بالذكاء الاصطناعي بجودة فائقة واحترافية عالية.',
    plans: [
      { id: '1', title: '1-Month Access', price: '$40', original: '$60', duration: '/mo', highlight: false, features: ['Fast GPU Time', 'Stealth Mode', 'Maximum Concurrent Jobs'] },
      { id: '2', title: '1-Year Access', price: '$33', original: '$60', duration: '/mo', highlight: true, features: ['Fast GPU Time', 'Stealth Mode', 'Maximum Concurrent Jobs', 'Commercial Usage'] },
    ]
  },
  claude: {
    name: 'Claude Opus',
    icon: Sparkles,
    image: '/sync-covers/claude.png',
    descEn: 'Highly capable, nuanced, and secure AI model by Anthropic.',
    descAr: 'نموذج ذكاء اصطناعي آمن ودقيق جداً في الكتابة وتحليل البيانات.',
    plans: [
      { id: '1', title: '100-Day Access', price: '$8', original: '$20', duration: '/mo', highlight: false, features: ['Claude 3 Opus Model', 'Massive Context Window', 'Advanced Reasoning'] },
      { id: '2', title: '1-Year Access', price: '$6', original: '$20', duration: '/mo', highlight: true, features: ['Claude 3 Opus Model', 'Massive Context Window', 'Advanced Reasoning', 'Priority Access'] },
    ]
  },
  canva: {
    name: 'Canva Pro',
    icon: Palette,
    image: '/sync-covers/canva.png',
    descEn: 'Premium design suite with AI tools and millions of assets.',
    descAr: 'مجموعة التصميم الاحترافية مع أدوات الذكاء الاصطناعي.',
    plans: [
      { id: '1', title: '6-Month Access', price: '$7', original: '$12', duration: '/mo', highlight: false, features: ['Magic Studio AI', '100M+ Premium Stock', 'Brand Kit'] },
      { id: '2', title: '1-Year Access', price: '$5', original: '$12', duration: '/mo', highlight: true, features: ['Magic Studio AI', '100M+ Premium Stock', 'Brand Kit', '1TB Cloud Storage'] },
    ]
  },
  elevenlabs: {
    name: 'ElevenLabs',
    icon: Music,
    image: '/sync-covers/elevenlabs.png',
    descEn: 'The most realistic and versatile AI speech software.',
    descAr: 'أقوى أداة لتوليد الأصوات بالذكاء الاصطناعي بواقعية لا مثيل لها.',
    plans: [
      { id: '1', title: 'Creator Plan', price: '$15', original: '$22', duration: '/mo', highlight: false, features: ['100,000 Characters', 'Professional Voice Cloning', 'Commercial Rights'] },
      { id: '2', title: 'Pro Plan', price: '$10', original: '$99', duration: '/mo', highlight: true, features: ['500,000 Characters', 'Highest Quality Audio', 'Priority Rendering'] },
    ]
  }
};

const GiftCard = ({ plan, tool, lang, currency }: any) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(false);
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  
  const discountText = plan.highlight ? '98% OFF' : (plan.discount || '95% OFF');

  const modalTitles: any = {
    details: lang === 'ar' ? 'معلومات تفصيلية' : 'Plan Details',
    policies: lang === 'ar' ? 'السياسات والشروط' : 'Policies & Terms',
    activation: lang === 'ar' ? 'تعليمات التفعيل' : 'Activation Setup',
    payment: lang === 'ar' ? 'الدفع وتفاصيله' : 'Payment Details',
  };
  
  const modalContents: any = {
    details: lang === 'ar' ? `هذه الباقة مصممة خصيصاً لتوفر لك أفضل المميزات من ${tool.name}. احصل على كل ما تحتاجه للبدء فوراً وبأقصى كفاءة.` : `This plan is specifically designed to provide you with the best features of ${tool.name}. Get everything you need to start immediately with maximum efficiency.`,
    policies: lang === 'ar' ? 'جميع الاشتراكات تخضع لشروط الاستخدام الخاصة بنا. لا يمكن استرداد المبلغ بعد تفعيل الباقة. يرجى التأكد من اختيار الباقة المناسبة.' : 'All subscriptions are subject to our terms of use. Refunds are not available after plan activation. Please ensure you select the appropriate plan.',
    activation: lang === 'ar' ? 'بعد إتمام الدفع، سيصلك بريد إلكتروني يحتوي على مفتاح التفعيل ورابط مباشر لتحميل أو الوصول للأداة فوراً.' : 'After completing the payment, you will receive an email containing the activation key and a direct link to access the tool immediately.',
    payment: lang === 'ar' ? 'نحن ندعم وسائل الدفع الآمنة بما في ذلك البطاقات الائتمانية، باي بال، ووسائل الدفع المحلية حسب دولتك.' : 'We support secure payment methods including credit cards, PayPal, and local payment methods depending on your country.'
  };

  const parsePrice = (priceStr: string) => parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  const rawPrice = parsePrice(plan.price);
  const rawOriginal = parsePrice(plan.original);

  const convertedPrice = (rawPrice * currency.rate).toFixed(2);
  const convertedOriginal = (rawOriginal * currency.rate).toFixed(2);

  return (
    <div className="flex flex-col relative" style={{ perspective: '1500px' }}>
      {/* Physical Gift Card */}
      <div 
        className="relative transition-all duration-700 hover:-translate-y-4 cursor-pointer mb-8"
        style={{ height: '540px', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Face */}
        <div 
          className="absolute inset-0 w-full rounded-4xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(180deg, #161e31 0%, #080b14 100%)',
            border: plan.highlight ? '2px solid var(--sync-yellow)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: plan.highlight ? '0 20px 50px rgba(255, 194, 26, 0.15)' : '0 20px 40px rgba(0,0,0,0.4)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: isFlipped ? 'none' : 'auto'
          }}
        >
          {/* Peg hole punch */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-3 rounded-full border border-[rgba(255,255,255,0.05)] shadow-inner z-20" style={{ background: 'var(--sync-bg)', opacity: 0.9 }}></div>
          
          {/* Top Section */}
          <div className="pt-10 px-8 pb-4 relative z-10 text-left shrink-0">
            <div className="flex justify-between items-center mb-6">
              <img src="/sync-logo.png" alt="SYNC" className="h-10 w-auto object-contain scale-[1.3] -ml-2 drop-shadow-md" />
              <span className="font-black text-xl" style={{ color: 'var(--sync-yellow)' }}>{discountText}</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: 'var(--sync-text-primary)' }}>{tool.name}</h3>
            <p style={{ color: 'var(--sync-yellow)' }} className="text-sm font-semibold tracking-wide uppercase">{plan.title}</p>
          </div>

          {/* Middle Holographic Ticket */}
          <div className="px-6 py-2 grow flex min-h-0">
            <div className="w-full h-full rounded-xl border flex flex-col items-center justify-center relative overflow-hidden shadow-inner" 
                style={{ 
                  borderColor: 'rgba(255,194,26,0.3)',
                  background: '#04165d' // Match roughly with the blue of the image if it doesn't cover fully
                }}>
              <div className="absolute inset-0 opacity-20 mix-blend-overlay z-10" style={{ background: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")', pointerEvents: 'none' }}></div>
              <img src="/sync-covers/products-ticket.jpg" alt="Products" className="w-full h-full object-cover relative z-0" />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="px-8 pb-8 pt-4 flex justify-between items-end mt-auto shrink-0">
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: 'var(--sync-text-primary)', opacity: 0.7 }}>
                {lang === 'ar' ? 'القيمة الأصلية' : 'ORIGINAL VALUE'}
              </p>
              <p className="text-2xl font-medium relative inline-block" style={{ color: 'var(--sync-text-primary)', opacity: 0.8 }}>
                {currency.symbol}{convertedOriginal}
                <span className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500/80 -rotate-12"></span>
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: 'var(--sync-yellow)' }}>
                {lang === 'ar' ? 'فقط' : 'ONLY'}
              </p>
              <div className="flex items-start">
                <span className="text-xl md:text-2xl font-bold mt-1" style={{ color: 'var(--sync-yellow)' }}>{currency.symbol}</span>
                <span className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: 'var(--sync-yellow)', lineHeight: '1' }}>
                  {convertedPrice.split('.')[0]}
                </span>
                {convertedPrice.includes('.') && (
                  <span className="text-xl md:text-2xl font-bold" style={{ color: 'var(--sync-yellow)' }}>
                    .{convertedPrice.split('.')[1]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div 
          className="absolute inset-0 w-full rounded-4xl overflow-hidden flex flex-col p-8"
          style={{
            background: 'linear-gradient(180deg, #080b14 0%, #161e31 100%)',
            border: plan.highlight ? '2px solid var(--sync-yellow)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: plan.highlight ? '0 20px 50px rgba(255, 194, 26, 0.15)' : '0 20px 40px rgba(0,0,0,0.4)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            pointerEvents: isFlipped ? 'auto' : 'none'
          }}
        >
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-3 rounded-full border border-[rgba(255,255,255,0.05)] shadow-inner z-20" style={{ background: 'var(--sync-bg)', opacity: 0.9 }}></div>
          
          <div className="flex justify-center mt-6 mb-4">
            <img src="/sync-logo.png" alt="SYNC" className="h-8 w-auto object-contain opacity-50 grayscale" />
          </div>
          
          {/* Options Toggle */}
          <button 
            type="button"
            className="absolute top-4 right-4 z-60 p-3 rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer group flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <HelpCircle className="w-6 h-6 opacity-80 transition-colors duration-300 pointer-events-none group-hover:text-[#ffc21a] text-white" />
          </button>
          
          <h4 className="text-xl font-bold text-center mb-6 uppercase tracking-widest" style={{ color: 'var(--sync-text-primary)' }}>{lang === 'ar' ? 'مميزات الباقة' : 'Plan Features'}</h4>
          
          <div className="grow flex flex-col justify-center">
            {showOptions ? (
              <div className="grid grid-cols-2 gap-3 z-30 shrink-0 w-full animate-in fade-in zoom-in duration-300">
                {/* 4 Action Links */}
                <button 
                  className="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:scale-105 border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] group"
                  onClick={(e) => { e.stopPropagation(); setActiveModal('details'); }}
                >
                  <Info className="w-6 h-6 mb-2 opacity-80 group-hover:scale-110 transition-transform" style={{ color: 'var(--sync-yellow)' }} />
                  <span className="text-[11px] font-bold text-center opacity-80" style={{ color: 'var(--sync-text-primary)' }}>{lang === 'ar' ? 'معلومات تفصيلية' : 'Details'}</span>
                </button>
                <button 
                  className="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:scale-105 border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] group"
                  onClick={(e) => { e.stopPropagation(); setActiveModal('policies'); }}
                >
                  <FileText className="w-6 h-6 mb-2 opacity-80 group-hover:scale-110 transition-transform" style={{ color: 'var(--sync-yellow)' }} />
                  <span className="text-[11px] font-bold text-center opacity-80" style={{ color: 'var(--sync-text-primary)' }}>{lang === 'ar' ? 'السياسات والشروط' : 'Policies & Terms'}</span>
                </button>
                <button 
                  className="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:scale-105 border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] group"
                  onClick={(e) => { e.stopPropagation(); setActiveModal('activation'); }}
                >
                  <Settings className="w-6 h-6 mb-2 opacity-80 group-hover:scale-110 transition-transform" style={{ color: 'var(--sync-yellow)' }} />
                  <span className="text-[11px] font-bold text-center opacity-80" style={{ color: 'var(--sync-text-primary)' }}>{lang === 'ar' ? 'تعليمات التفعيل' : 'Activation Setup'}</span>
                </button>
                <button 
                  className="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:scale-105 border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] group"
                  onClick={(e) => { e.stopPropagation(); setActiveModal('payment'); }}
                >
                  <CreditCard className="w-6 h-6 mb-2 opacity-80 group-hover:scale-110 transition-transform" style={{ color: 'var(--sync-yellow)' }} />
                  <span className="text-[11px] font-bold text-center opacity-80" style={{ color: 'var(--sync-text-primary)' }}>{lang === 'ar' ? 'الدفع وتفاصيله' : 'Payment Details'}</span>
                </button>
              </div>
            ) : (
              <ul className="space-y-4 animate-in fade-in zoom-in duration-300">
                {plan.features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full shrink-0" style={{ background: 'rgba(255,194,26,0.1)' }}>
                      <CheckCircle className="w-4 h-4" style={{ color: 'var(--sync-yellow)' }} />
                    </div>
                    <span style={{ color: 'var(--sync-text-primary)' }} className="opacity-90 font-medium text-sm text-left">{feat}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Action Button moved to back */}
          <button 
            className="w-full py-4 mt-6 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(0,0,0,0.2)] relative overflow-hidden group/btn z-30 shrink-0" 
            style={{ background: plan.highlight ? 'var(--sync-yellow)' : 'var(--sync-surface)', color: plan.highlight ? '#0B132B' : 'var(--sync-text-primary)', border: plan.highlight ? 'none' : '1px solid var(--sync-yellow)' }}
            onClick={(e) => e.stopPropagation()} // Prevent card flip when clicking the subscribe button
          >
            <span className="relative z-10">{lang === 'ar' ? 'اشترك الآن' : 'Get Plan'}</span>
            <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300" style={{ background: plan.highlight ? '#fff' : 'var(--sync-yellow)' }} />
          </button>
        </div>
      </div>
      {/* Modal Overlay */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => { e.stopPropagation(); setActiveModal(null); }}
        >
          <div 
            className="bg-[#0B132B] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white tracking-wider">{modalTitles[activeModal]}</h3>
              <button onClick={(e) => { e.stopPropagation(); setActiveModal(null); }} className="text-white/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-white/80 leading-relaxed text-sm md:text-base">
               {modalContents[activeModal]}
            </div>
            <button 
              className="w-full mt-8 py-3 rounded-xl font-bold transition-colors bg-(--sync-yellow) text-[#0B132B] hover:bg-white"
              onClick={(e) => { e.stopPropagation(); setActiveModal(null); }}
            >
              {lang === 'ar' ? 'حسناً، فهمت' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = React.use(params);
  const { lang } = useSync();
  const [selectedCurrency, setSelectedCurrency] = React.useState(CURRENCIES[0]);
  const tool = TOOLS_DATA[unwrappedParams.slug];

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--sync-text-primary)' }}>Tool Not Found</h1>
          <Link href="/" className="px-6 py-3 rounded-full font-bold transition-all hover:scale-105 inline-block" style={{ background: 'var(--sync-yellow)', color: '#0B132B' }}>
            {lang === 'ar' ? 'الرجوع للعروض' : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  const Icon = tool.icon;

  return (
    <div className="pt-32 pb-24 min-h-screen relative z-10 overflow-hidden" style={{ background: 'var(--sync-bg)' }}>
      {/* Dynamic Background Image & Glow */}
      {tool.image ? (
        <div className="absolute top-0 left-0 right-0 h-[60vh] z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(11, 19, 43, 0.4) 0%, var(--sync-bg) 100%)' }} />
          <div className="absolute inset-0 z-10 opacity-60" style={{ background: 'var(--sync-bg)' }} />
          <img src={tool.image} alt={tool.name} className="w-full h-full object-cover opacity-50 mix-blend-screen blur-[2px]" />
        </div>
      ) : (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 opacity-20 pointer-events-none blur-[120px]" style={{ background: 'radial-gradient(circle, var(--sync-yellow) 0%, transparent 70%)' }} />
      )}

      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24 relative z-10">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/10 hover:border-white/30 transition-all backdrop-blur-md relative z-20" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--sync-text-primary)' }}>
          {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span className="font-semibold text-sm">{lang === 'ar' ? 'الرجوع للعروض' : 'Back to Deals'}</span>
        </Link>

        {/* Hero Section for Tool */}
        <div className="flex flex-col items-center gap-6 mb-20 text-center relative z-20 mt-4">
          {!tool.image && (
            <div className="relative group">
              <div className="absolute inset-0 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'var(--sync-yellow)' }} />
              <div className="relative w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-105" style={{ background: 'var(--sync-surface)', border: '1px solid var(--sync-yellow)' }}>
                <Icon className="w-16 h-16" style={{ color: 'var(--sync-yellow)' }} />
              </div>
            </div>
          )}
          <div className={tool.image ? "mt-0" : "mt-4"}>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-lg" style={{ color: 'var(--sync-text-primary)' }}>{tool.name}</h1>
            <p className="text-xl md:text-2xl opacity-80 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--sync-text-primary)' }}>
              {lang === 'ar' ? tool.descAr : tool.descEn}
            </p>
          </div>
        </div>

        {/* Plans Grid Header & Currency Selector */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 relative z-30">
          <div className="md:w-1/3 hidden md:block"></div> {/* Spacer for centering */}
          
          <div className="text-center md:w-1/3">
            <h2 className="text-3xl md:text-4xl font-bold inline-block relative" style={{ color: 'var(--sync-text-primary)' }}>
              {lang === 'ar' ? 'الباقات المتاحة' : 'Available Plans'}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full" style={{ background: 'var(--sync-yellow)' }} />
            </h2>
          </div>
          
          <div className="md:w-1/3 flex justify-center md:justify-end">
            <div className="relative group">
              <select 
                value={selectedCurrency.code} 
                onChange={(e) => setSelectedCurrency(CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0])}
                className="appearance-none outline-none py-3 px-6 pr-12 rounded-xl font-bold cursor-pointer transition-all duration-300 hover:scale-105"
                style={{ 
                  background: 'rgba(11, 19, 43, 0.8)', 
                  color: 'var(--sync-yellow)',
                  border: '1px solid rgba(255,194,26,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} style={{ background: '#080b14', color: 'var(--sync-yellow)' }}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none transition-transform duration-300 group-hover:translate-y-[-2px]" style={{ color: 'var(--sync-yellow)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {tool.plans.map((plan: any) => (
            <GiftCard key={plan.id} plan={plan} tool={tool} lang={lang} currency={selectedCurrency} />
          ))}
        </div>

      </div>
    </div>
  );
}
