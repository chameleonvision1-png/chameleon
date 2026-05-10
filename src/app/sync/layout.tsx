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
  metadataBase: new URL('https://sync.chameleon.vision'),
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
        url: '/sync-logo.png',
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
    images: ['/sync-logo.png'],
  },
};

import SyncNavbar from '@/components/sync/SyncNavbar';
import SyncFooter from '@/components/sync/SyncFooter';
import SyncCartDrawer from '@/components/sync/SyncCartDrawer';
import SyncPrivacyBanner from '@/components/sync/SyncPrivacyBanner';

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
        <SyncCartDrawer />
        <SyncPrivacyBanner />
      </SyncProviders>
    </div>
  );
}
