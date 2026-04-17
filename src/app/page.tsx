"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import PortfolioCarousel from "@/components/PortfolioCarousel";
import SMMMarket from "@/components/SMMMarket";
import AITools from "@/components/AITools";
import LogoMarket from "@/components/LogoMarket";
import AssetsMarket from "@/components/AssetsMarket";
import EnterpriseSolutions from "@/components/EnterpriseSolutions";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <PortfolioCarousel />
      <SMMMarket />
      <AITools />
      <LogoMarket />
      <AssetsMarket />
      <EnterpriseSolutions />
      <Footer />
    </>
  );
}
