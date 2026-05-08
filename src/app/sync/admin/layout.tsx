import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SYNC Admin | Control Panel',
  description: 'SYNC Store Admin Dashboard',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
