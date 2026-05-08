import { Metadata } from 'next';
import { Montserrat, Tajawal } from "next/font/google";
import "./sync.css";
import { SyncProviders } from "@/components/sync/SyncProviders";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ['400', '600', '700', '800', '900']
});

const tajawal = Tajawal({ 
  subsets: ["arabic"],
  variable: "--font-tajawal",
  weight: ['400', '500', '700', '800']
});

export const metadata: Metadata = {
  title: 'SYNC | Premium AI Access',
  description: 'احصل على اشتراكات بريميوم لأشهر أدوات الذكاء الاصطناعي والتصميم بأسعار لا تقبل المنافسة. Premium subscriptions for AI & creative tools.',
  icons: {
    icon: '/sync-favicon.png',
  },
  openGraph: {
    title: 'SYNC | Premium AI Access',
    description: 'بوابتك الذكية للوصول إلى كافة أدوات الذكاء الاصطناعي والتصميم بأسعار تنافسية. اشترك الآن في ChatGPT, Gemini, Midjourney وغيرها.',
    siteName: 'SYNC',
    images: [
      {
        url: '/sync/covers/gemini.png', // Using the cinematic Gemini cover as the default share image since it looks great and has a dark background
        width: 1200,
        height: 630,
        alt: 'SYNC Premium AI Access',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SYNC | Premium AI Access',
    description: 'بوابتك الذكية للوصول إلى كافة أدوات الذكاء الاصطناعي والتصميم.',
    images: ['/sync/covers/gemini.png'],
  },
};

import SyncNavbar from '@/components/sync/SyncNavbar';
import SyncFooter from '@/components/sync/SyncFooter';

export default function SyncLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${montserrat.variable} ${tajawal.variable}`}>
      <SyncProviders>
        <SyncNavbar />
        <main>
          {children}
        </main>
        <SyncFooter />
      </SyncProviders>
    </div>
  );
}
