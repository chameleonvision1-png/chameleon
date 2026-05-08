import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'خوارزم | Khawarizm',
  description: 'خدمات زيادة المتابعين والتسويق الإلكتروني',
  icons: {
    icon: '/khawarizm-favicon.png',
  },
};

export default function KhawarizmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
