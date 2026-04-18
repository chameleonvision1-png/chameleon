import type { Metadata } from "next";
import { Epilogue, Manrope, Cairo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-epilogue",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chameleon — Digital Agency",
  description:
    "منصة رقمية متكاملة تقدم خدمات تصميم المواقع، السوشيال ميديا، الذكاء الاصطناعي، وحلول المؤسسات.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${epilogue.variable} ${manrope.variable} ${cairo.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
