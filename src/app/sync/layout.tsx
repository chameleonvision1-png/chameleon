import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سينك | Sync',
  description: 'أدوات الذكاء الاصطناعي واشتراكات وعروض البرامج',
  icons: {
    icon: '/sync-favicon.png',
  },
};

export default function SyncLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sync-app min-h-screen bg-slate-950 text-white font-cairo">
      {/* You can add a specific header for Sync here */}
      <main>{children}</main>
    </div>
  );
}
