import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KhawarizmPage() {
  return (
    <main className="min-h-screen bg-[#080a0f] text-white">
      <Navbar />
      
      <div className="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen flex flex-col">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span className="font-display text-[10px] md:text-xs tracking-[0.25em] text-white/80 uppercase">Khawarizm</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-arabic font-bold text-white mb-6 tracking-tight leading-tight">
            خوارزم
          </h1>
          <p className="font-arabic text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed">
            الباقة الشاملة لإدارة وتسويق حسابات السوشيال ميديا الخاصة بك، لنمو استثنائي وحضور رقمي قوي.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#111319] border border-white/10 rounded-3xl p-8 md:p-12 text-center max-w-2xl w-full">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h2 className="text-3xl font-arabic font-bold text-white mb-4">التفاصيل قريباً</h2>
            <p className="text-white/50 font-arabic text-lg leading-relaxed mb-8">
              نعمل حالياً على تجهيز باقات خوارزم وتفاصيلها الكاملة لتلبي كافة احتياجات مؤسستك.
            </p>
            <a href={process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://chameleon.vision'} className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-arabic font-bold rounded-xl hover:bg-gray-200 transition-colors">
              العودة للرئيسية
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
