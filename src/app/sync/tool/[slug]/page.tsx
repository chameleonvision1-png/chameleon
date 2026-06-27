"use client";

import React, { useState, useEffect } from 'react';
import { useSync } from '@/components/sync/SyncProviders';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, Info, FileText, Settings, CreditCard, HelpCircle, X, Loader2, Sparkles, ShoppingCart } from 'lucide-react';
import { createSyncClient } from '@/lib/sync/supabase-client';
import { useSyncCart } from '@/components/sync/SyncCartProvider';

const DEFAULT_CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1, label: 'USD ($)' },
  { code: 'EGP', symbol: 'EGP', rate: 50.8, label: 'EGP (ج.م)' },
  { code: 'SAR', symbol: 'SAR', rate: 3.75, label: 'SAR (ر.س)' },
  { code: 'AED', symbol: 'AED', rate: 3.67, label: 'AED (د.إ)' },
  { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
];

interface Plan {
  id: string;
  title_en: string;
  title_ar: string;
  price_usd: number;
  original_price_usd: number | null;
  store_original_price_usd: number | null;
  duration_days: number;
  is_highlighted: boolean;
  has_extra_discount: boolean;
  is_active: boolean;
  discount_label: string | null;
  features: string[];
  sort_order: number;
  stock_count: number | null;
  units_sold: number;
  delivery_type: string;
  mini_card_url: string | null;
  custom_details_ar?: string | null;
  custom_details_en?: string | null;
  custom_activation_ar?: string | null;
  custom_activation_en?: string | null;
  custom_policies_ar?: string | null;
  custom_policies_en?: string | null;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  description_en: string | null;
  description_ar: string | null;
  cover_image_url: string | null;
  plans: Plan[];
}

const TicketSVG = ({ slug, name, lang, plan }: { slug: string; name: string; lang: string; plan: Plan }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'star':
        return <path d="M 0 -12 L 3 -3 L 12 -3 L 5 2 L 8 10 L 0 5 L -8 10 L -5 2 L -12 -3 L -3 -3 Z" fill="var(--gift-card-accent)" />;
      case 'zap':
        return <path d="M 4 -14 L -8 0 L -1 0 L -5 16 L 8 2 L 1 2 Z" fill="var(--gift-card-accent)" />;
      case 'cloud':
        return <path d="M -6 6 C -12 6 -12 -2 -6 -2 C -6 -10 6 -10 6 -2 C 12 -2 12 6 6 6 Z" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" />;
      case 'lock':
        return (
          <g transform="translate(-8, -6)">
            <rect x="0" y="5" width="16" height="11" rx="2" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
            <path d="M 3 5 L 3 2.5 C 3 0.5 13 0.5 13 2.5 L 13 5" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
          </g>
        );
      case 'check':
        return (
          <g>
            <circle cx="0" cy="0" r="9" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
            <path d="M -4 0 L -1 3 L 4 -3" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'device':
        return (
          <g transform="translate(-11, -8)">
            <rect width="22" height="15" rx="2" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
            <line x1="4" y1="15" x2="18" y2="15" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
            <line x1="7" y1="18" x2="15" y2="18" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
          </g>
        );
      case 'film':
        return (
          <g transform="translate(-10, -10)">
            <rect x="0" y="0" width="20" height="20" rx="2" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
            <line x1="0" y1="6" x2="20" y2="6" stroke="var(--gift-card-accent)" strokeWidth="2" />
            <line x1="0" y1="14" x2="20" y2="14" stroke="var(--gift-card-accent)" strokeWidth="2" />
            <circle cx="4" cy="3" r="1.5" fill="var(--gift-card-accent)" />
            <circle cx="16" cy="3" r="1.5" fill="var(--gift-card-accent)" />
            <circle cx="4" cy="17" r="1.5" fill="var(--gift-card-accent)" />
            <circle cx="16" cy="17" r="1.5" fill="var(--gift-card-accent)" />
          </g>
        );
      case 'music':
        return (
          <g transform="translate(-5, -7)">
            <circle cx="0" cy="12" r="4" fill="var(--gift-card-accent)" />
            <path d="M 4 0 L 4 12" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
            <path d="M 4 0 Q 10 0 10 4" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'design':
        return (
          <g transform="translate(-10, -10)">
            <path d="M 3 18 C 3 13 8 10 13 10 C 18 10 20 14 18 18 C 16 21 11 21 8 21 C 5 21 3 18 3 18 Z" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
            <circle cx="8" cy="14" r="2" fill="var(--gift-card-accent)" />
            <circle cx="13" cy="14" r="2" fill="var(--gift-card-accent)" />
          </g>
        );
      case 'search':
        return (
          <g transform="translate(-4, -4)">
            <circle cx="0" cy="0" r="6" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
            <line x1="4.5" y1="4.5" x2="11" y2="11" stroke="var(--gift-card-accent)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'code':
        return <path d="M -5 -8 L -10 -3 L -5 2 M 5 -8 L 10 -3 L 5 2" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />;
      case 'cpu':
        return (
          <g transform="translate(-10, -10)">
            <rect x="2" y="2" width="16" height="16" rx="3" fill="none" stroke="var(--gift-card-accent)" strokeWidth="2.5" />
            <line x1="0" y1="6" x2="2" y2="6" stroke="var(--gift-card-accent)" strokeWidth="2" />
            <line x1="0" y1="14" x2="2" y2="14" stroke="var(--gift-card-accent)" strokeWidth="2" />
            <line x1="18" y1="6" x2="20" y2="6" stroke="var(--gift-card-accent)" strokeWidth="2" />
            <line x1="18" y1="14" x2="20" y2="14" stroke="var(--gift-card-accent)" strokeWidth="2" />
            <line x1="6" y1="0" x2="6" y2="2" stroke="var(--gift-card-accent)" strokeWidth="2" />
            <line x1="14" y1="0" x2="14" y2="2" stroke="var(--gift-card-accent)" strokeWidth="2" />
            <line x1="6" y1="18" x2="6" y2="20" stroke="var(--gift-card-accent)" strokeWidth="2" />
            <line x1="14" y1="18" x2="14" y2="20" stroke="var(--gift-card-accent)" strokeWidth="2" />
          </g>
        );
      default:
        return <circle cx="0" cy="0" r="8" fill="var(--gift-card-accent)" />;
    }
  };

  const CONFIGS: Record<string, {
    topLabel: string;
    brandName: string;
    gradient: [string, string];
    premiumGradient: [string, string];
    features: { icon: string; label: string }[];
  }> = {
    'gemini': {
      topLabel: 'Google Ai pro',
      brandName: 'GEMINI PRO',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'star', label: '1.5 Pro' },
        { icon: 'zap', label: 'Fast Speed' },
        { icon: 'cloud', label: '5TB Storage' },
        { icon: 'check', label: 'Workspace' },
        { icon: 'code', label: 'AI Coding' },
        { icon: 'search', label: 'Live Web' },
        { icon: 'lock', label: 'Private' },
        { icon: 'star', label: 'Priority' }
      ]
    },
    'chatgpt': {
      topLabel: 'OpenAi pro',
      brandName: 'CHATGPT PLUS',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'star', label: 'GPT-4o' },
        { icon: 'design', label: 'DALL-E 3' },
        { icon: 'code', label: 'Advanced Code' },
        { icon: 'zap', label: 'Voice Mode' },
        { icon: 'search', label: 'Custom GPTs' },
        { icon: 'lock', label: 'Private Data' },
        { icon: 'cloud', label: 'Workspace' },
        { icon: 'star', label: 'Priority' }
      ]
    },
    'netflix': {
      topLabel: 'Netflix pro',
      brandName: 'NETFLIX',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'device', label: '4K Ultra HD' },
        { icon: 'lock', label: 'Private Profile' },
        { icon: 'star', label: 'Atmos Sound' },
        { icon: 'cloud', label: 'Offline Save' },
        { icon: 'film', label: 'Unlimited' },
        { icon: 'check', label: 'Warranty' },
        { icon: 'device', label: 'Multi-Device' },
        { icon: 'zap', label: 'Ad-Free' }
      ]
    },
    'canva': {
      topLabel: 'Canva pro',
      brandName: 'CANVA PRO',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'star', label: 'Magic Studio' },
        { icon: 'lock', label: 'Brand Kit' },
        { icon: 'design', label: 'Premium Stock' },
        { icon: 'check', label: 'BG Remover' },
        { icon: 'zap', label: 'Magic Resize' },
        { icon: 'cloud', label: 'Templates' },
        { icon: 'film', label: 'AI Video' },
        { icon: 'device', label: 'Collab' }
      ]
    },
    'spotify': {
      topLabel: 'Spotify pro',
      brandName: 'SPOTIFY',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'music', label: 'Hi-Fi Audio' },
        { icon: 'check', label: 'Ad-Free' },
        { icon: 'cloud', label: 'Offline Play' },
        { icon: 'zap', label: 'Unlimited Skips' },
        { icon: 'star', label: 'Live Lyrics' },
        { icon: 'lock', label: 'Group Session' },
        { icon: 'music', label: 'High Bitrate' },
        { icon: 'check', label: 'Podcasts' }
      ]
    },
    'cursor': {
      topLabel: 'Cursor pro',
      brandName: 'CURSOR PRO',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'code', label: 'Autocomplete' },
        { icon: 'star', label: 'Composer' },
        { icon: 'zap', label: 'Pro Models' },
        { icon: 'lock', label: 'Privacy Mode' },
        { icon: 'cloud', label: 'AI History' },
        { icon: 'check', label: 'Terminal Chat' },
        { icon: 'code', label: 'Symbol Search' },
        { icon: 'zap', label: 'Fast Apply' }
      ]
    },
    'claude': {
      topLabel: 'Anthropic pro',
      brandName: 'CLAUDE PRO',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'star', label: 'Claude 3.5' },
        { icon: 'zap', label: 'High Limits' },
        { icon: 'code', label: 'Artifacts' },
        { icon: 'cloud', label: 'Projects' },
        { icon: 'search', label: 'AI Analysis' },
        { icon: 'check', label: 'Priority' },
        { icon: 'lock', label: 'Private Data' },
        { icon: 'star', label: 'API Access' }
      ]
    },
    'figma': {
      topLabel: 'Figma pro',
      brandName: 'FIGMA PRO',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'design', label: 'Dev Mode' },
        { icon: 'star', label: 'Prototyping' },
        { icon: 'zap', label: 'Collab' },
        { icon: 'cloud', label: 'Shared Library' },
        { icon: 'check', label: 'Unlimited' },
        { icon: 'lock', label: 'Private Files' },
        { icon: 'star', label: 'Plugins' },
        { icon: 'device', label: 'Figma Slides' }
      ]
    },
    'amazon-prime-video': {
      topLabel: 'Prime pro',
      brandName: 'PRIME VIDEO',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'device', label: '4K Ultra HD' },
        { icon: 'lock', label: '2 Screens' },
        { icon: 'film', label: 'Originals' },
        { icon: 'cloud', label: 'Downloads' },
        { icon: 'star', label: 'X-Ray Details' },
        { icon: 'check', label: 'Warranty' },
        { icon: 'device', label: 'Multi-Device' },
        { icon: 'zap', label: 'Ad-Free' }
      ]
    },
    'prime-video': {
      topLabel: 'Prime pro',
      brandName: 'PRIME VIDEO',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'device', label: '4K Ultra HD' },
        { icon: 'lock', label: '2 Screens' },
        { icon: 'film', label: 'Originals' },
        { icon: 'cloud', label: 'Downloads' },
        { icon: 'star', label: 'X-Ray Details' },
        { icon: 'check', label: 'Warranty' },
        { icon: 'device', label: 'Multi-Device' },
        { icon: 'zap', label: 'Ad-Free' }
      ]
    },
    'perplexity': {
      topLabel: 'Perplexity pro',
      brandName: 'PERPLEXITY',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'search', label: 'Pro Queries' },
        { icon: 'cloud', label: 'File Upload' },
        { icon: 'star', label: 'Claude/GPT-4' },
        { icon: 'check', label: 'Citations' },
        { icon: 'zap', label: 'Copilot' },
        { icon: 'lock', label: 'Collection' },
        { icon: 'star', label: 'AI Writing' },
        { icon: 'check', label: 'API Access' }
      ]
    },
    'replit': {
      topLabel: 'Replit pro',
      brandName: 'REPLIT CORE',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'code', label: 'Cloud VM' },
        { icon: 'zap', label: 'Autocompletions' },
        { icon: 'cloud', label: 'Instant Deploy' },
        { icon: 'lock', label: 'Private Repls' },
        { icon: 'star', label: 'Replit AI' },
        { icon: 'check', label: 'Workspace' },
        { icon: 'code', label: 'SSH Access' },
        { icon: 'zap', label: 'Fast Boost' }
      ]
    },
    'lovable-ai': {
      topLabel: 'Lovable pro',
      brandName: 'LOVABLE PRO',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'star', label: 'AI Prompting' },
        { icon: 'zap', label: 'Fast Build' },
        { icon: 'cloud', label: '1-Click Deploy' },
        { icon: 'code', label: 'Export Code' },
        { icon: 'check', label: 'Custom Domain' },
        { icon: 'lock', label: 'Private Apps' },
        { icon: 'star', label: 'GPT-4o Engine' },
        { icon: 'zap', label: 'Premium VM' }
      ]
    },
    'manus-pro': {
      topLabel: 'Manus pro',
      brandName: 'MANUS PRO',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'zap', label: 'Automations' },
        { icon: 'star', label: '3300+ Credits' },
        { icon: 'device', label: 'Web Control' },
        { icon: 'code', label: 'Multi-Agent' },
        { icon: 'check', label: 'Unlimited tasks' },
        { icon: 'lock', label: 'Secure Session' },
        { icon: 'star', label: 'Priority VM' },
        { icon: 'zap', label: 'API Access' }
      ]
    },
    'openart': {
      topLabel: 'OpenArt pro',
      brandName: 'OPENART',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'design', label: '12k Credits' },
        { icon: 'star', label: 'All AI Models' },
        { icon: 'zap', label: 'AI Upscaler' },
        { icon: 'cloud', label: 'Fine-Tuning' },
        { icon: 'check', label: 'Brush Edit' },
        { icon: 'lock', label: 'Private Gen' },
        { icon: 'star', label: 'Sketch-to-Img' },
        { icon: 'design', label: 'Ad-Free' }
      ]
    },
    'nordvpn': {
      topLabel: 'NordVPN pro',
      brandName: 'NORDVPN',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'lock', label: 'Ultra Secure' },
        { icon: 'zap', label: 'High Speed' },
        { icon: 'cloud', label: 'Global Servers' },
        { icon: 'device', label: '6 Devices' },
        { icon: 'check', label: 'Shield Ad-Block' },
        { icon: 'star', label: 'Double VPN' },
        { icon: 'lock', label: 'No Logs Policy' },
        { icon: 'check', label: 'Fast P2P' }
      ]
    },
    'telegram-premium': {
      topLabel: 'Telegram pro',
      brandName: 'TELEGRAM',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'zap', label: 'Double Limits' },
        { icon: 'cloud', label: 'Fast Download' },
        { icon: 'star', label: 'Premium Badge' },
        { icon: 'lock', label: 'Voice-to-Text' },
        { icon: 'check', label: 'Ad-Free' },
        { icon: 'design', label: 'Emojis' },
        { icon: 'star', label: 'Profile Badge' },
        { icon: 'zap', label: 'Realtime Translation' }
      ]
    },
    'railway': {
      topLabel: 'Railway pro',
      brandName: 'RAILWAY.COM',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'cpu', label: 'Auto Deploy' },
        { icon: 'cloud', label: 'Database Host' },
        { icon: 'check', label: 'Zero Downtime' },
        { icon: 'zap', label: 'Private Net' },
        { icon: 'lock', label: 'CLI Control' },
        { icon: 'star', label: 'Pro Limits' },
        { icon: 'cloud', label: 'Team Shared' },
        { icon: 'check', label: 'SSL Included' }
      ]
    },
    'kiromax': {
      topLabel: 'Kiromax pro',
      brandName: 'KIROMAX AI',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'zap', label: '5000+ Credits' },
        { icon: 'check', label: 'Safety Limit' },
        { icon: 'star', label: 'Balance Upgrade' },
        { icon: 'lock', label: 'Fast Recharge' },
        { icon: 'cloud', label: 'Flex Limits' },
        { icon: 'code', label: 'API Access' },
        { icon: 'star', label: 'Premium VM' },
        { icon: 'check', label: 'All AI models' }
      ]
    },
    'adobe': {
      topLabel: 'Adobe pro',
      brandName: 'ADOBE CC',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'design', label: '20+ Apps' },
        { icon: 'cloud', label: '100GB Cloud' },
        { icon: 'star', label: 'Firefly AI' },
        { icon: 'check', label: 'Official License' },
        { icon: 'zap', label: 'Font Library' },
        { icon: 'lock', label: 'Portfolio' },
        { icon: 'design', label: 'Illustrator' },
        { icon: 'star', label: 'Photoshop AI' }
      ]
    },
    'xai-super-grok': {
      topLabel: 'xAI pro',
      brandName: 'SUPER GROK',
      gradient: ['#0046ff', '#001a75'],
      premiumGradient: ['#0b132b', '#050918'],
      features: [
        { icon: 'star', label: 'Grok 4.2' },
        { icon: 'cpu', label: 'Parallel Agents' },
        { icon: 'search', label: 'DeepSearch' },
        { icon: 'zap', label: 'Think Mode' },
        { icon: 'lock', label: 'X Premium+' },
        { icon: 'check', label: 'Real-Time Data' },
        { icon: 'star', label: 'Fast speed' },
        { icon: 'cpu', label: 'Full Access' }
      ]
    }
  };

  const defaultConfig = {
    topLabel: 'Premium pro',
    brandName: name.toUpperCase(),
    gradient: ['#0046ff', '#001a75'] as [string, string],
    premiumGradient: ['#0b132b', '#050918'] as [string, string],
    features: [
      { icon: 'star', label: 'Premium Access' },
      { icon: 'zap', label: 'Fast Speed' },
      { icon: 'lock', label: 'Private Account' },
      { icon: 'check', label: 'Full Warranty' },
      { icon: 'device', label: 'All Devices' },
      { icon: 'cloud', label: 'Cloud Storage' },
      { icon: 'film', label: 'No Ads' },
      { icon: 'star', label: '24/7 Support' }
    ]
  };

  const config = CONFIGS[slug] || defaultConfig;
  
  const isPremium = plan.is_highlighted || (plan.duration_days && plan.duration_days > 180);
  const [colorStart, colorEnd] = isPremium ? config.premiumGradient : config.gradient;
  const xCoords = [65, 160, 255, 350, 445, 540, 635, 730];

  return (
    <svg width="100%" height="100%" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full object-cover gift-card-svg ${isPremium ? 'premium-card' : 'normal-card'}`}>
      <defs>
        <linearGradient id={`giftCardBg-${slug}-${plan.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--gift-card-start)" />
          <stop offset="100%" stopColor="var(--gift-card-end)" />
        </linearGradient>
        
        <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.5" fill="var(--gift-card-text-primary)" opacity="var(--gift-card-dots-opacity)" />
        </pattern>

        <radialGradient id={`glowGrad-${slug}-${plan.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--gift-card-accent)" stopOpacity="var(--gift-card-glow-opacity)" />
          <stop offset="100%" stopColor="var(--gift-card-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Gift Card Base Rect */}
      <rect width="800" height="450" rx="28" fill={`url(#giftCardBg-${slug}-${plan.id})`} />
      <rect width="800" height="450" rx="28" fill="url(#dotPattern)" />

      {/* Soft hardware-accelerated radial glow (zero rendering lag) */}
      <circle cx="400" cy="225" r="240" fill={`url(#glowGrad-${slug}-${plan.id})`} />

      {/* Glossy Diagonal Reflections (Holographic Card Effect) */}
      <path d="M 150 0 L 320 0 L 170 450 L 0 450 Z" fill="#FFFFFF" opacity="0.05" />
      <path d="M 380 0 L 440 0 L 290 450 L 230 450 Z" fill="#FFFFFF" opacity="0.03" />

      {/* Sleek Thin Border */}
      <rect x="15" y="15" width="770" height="420" rx="24" fill="none" stroke="var(--gift-card-border)" strokeWidth="2" />

      {/* Top Left Branding Text */}
      <text x="400" y="90" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" fontSize="20" fill="var(--gift-card-text-primary)" opacity="0.8" textAnchor="middle" letterSpacing="3">{config.topLabel}</text>

      {/* Graffiti/Brush splash effect behind brand name */}
      <path d="M 160 220 C 300 240 500 240 640 220 C 500 205 300 205 160 220 Z" fill="var(--gift-card-accent)" opacity="var(--gift-card-glow-opacity)" />
      <circle cx="280" cy="235" r="3" fill="var(--gift-card-accent)" opacity="0.3" />
      <circle cx="340" cy="230" r="4.5" fill="var(--gift-card-accent)" opacity="0.3" />
      <circle cx="480" cy="240" r="3.5" fill="var(--gift-card-accent)" opacity="0.3" />
      <circle cx="560" cy="233" r="4" fill="var(--gift-card-accent)" opacity="0.3" />

      {/* Offset hardware-accelerated text drop shadows (zero rendering lag) */}
      <text x="400" y="225" fontFamily="'Outfit', 'Inter', system-ui, sans-serif" fontWeight="900" fontSize="72" fill="#000000" opacity="0.22" letterSpacing="4" textAnchor="middle">
        {config.brandName}
      </text>

      {/* Center Brand Name */}
      <text x="400" y="222" fontFamily="'Outfit', 'Inter', system-ui, sans-serif" fontWeight="900" fontSize="72" fill="var(--gift-card-accent)" letterSpacing="4" textAnchor="middle">
        {config.brandName}
      </text>

      {/* Bottom Features Row */}
      {config.features.map((feat, idx) => {
        const x = xCoords[idx] || 400;
        return (
          <g key={idx}>
            <g transform={`translate(${x}, 320)`}>
              {getIcon(feat.icon)}
            </g>
            <text x={x} y={365} fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" fontSize="11" fill="var(--gift-card-text-primary)" opacity="0.8" textAnchor="middle">{feat.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

const GiftCard = ({ plan, tool, lang, currency, onAddToCart }: { plan: Plan; tool: Product; lang: string; currency: any; onAddToCart: () => void }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(false);
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  
  const availableStock = plan.stock_count || 0;
  const isOutOfStock = plan.delivery_type !== 'user_provides_email' && availableStock === 0;
  const discountText = plan.discount_label || '';
  const planTitle = lang === 'ar' ? plan.title_ar : plan.title_en;

  const modalTitles: any = {
    details_activation: lang === 'ar' ? 'التفاصيل وطريقة التفعيل' : 'Details & Activation',
    details: lang === 'ar' ? 'معلومات تفصيلية' : 'Plan Details',
    policies: lang === 'ar' ? 'السياسات والشروط' : 'Policies & Terms',
    activation: lang === 'ar' ? 'تعليمات التفعيل' : 'Activation Setup',
    payment: lang === 'ar' ? 'الدفع وتفاصيله' : 'Payment Details',
  };
  
  const modalContents: any = {
    details_activation: (
      <div className="space-y-6">
        <div>
          <h4 className="text-(--sync-yellow) font-bold mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" /> 
            {lang === 'ar' ? 'معلومات تفصيلية' : 'Detailed Information'}
          </h4>
          <p>{lang === 'ar' ? (plan.custom_details_ar || `هذه الباقة مصممة خصيصاً لتوفر لك أفضل المميزات من ${tool.name}. احصل على كل ما تحتاجه للبدء فوراً وبأقصى كفاءة.`) : (plan.custom_details_en || `This plan is specifically designed to provide you with the best features of ${tool.name}. Get everything you need to start immediately with maximum efficiency.`)}</p>
        </div>
        <div className="border-t border-white/10 pt-4">
          <h4 className="text-(--sync-yellow) font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {lang === 'ar' ? 'طريقة التفعيل' : 'Activation Method'}
          </h4>
          <p>{lang === 'ar' ? (plan.custom_activation_ar || 'بعد إتمام الدفع، سيصلك بريد إلكتروني يحتوي على مفتاح التفعيل ورابط مباشر لتحميل أو الوصول للأداة فوراً.') : (plan.custom_activation_en || 'After completing the payment, you will receive an email containing the activation key and a direct link to access the tool immediately.')}</p>
        </div>
      </div>
    ),
    details: lang === 'ar' ? (plan.custom_details_ar || `هذه الباقة مصممة خصيصاً لتوفر لك أفضل المميزات من ${tool.name}. احصل على كل ما تحتاجه للبدء فوراً وبأقصى كفاءة.`) : (plan.custom_details_en || `This plan is specifically designed to provide you with the best features of ${tool.name}. Get everything you need to start immediately with maximum efficiency.`),
    policies: lang === 'ar' ? (plan.custom_policies_ar || 'تخضع جميع الاشتراكات والمنتجات الرقمية المباعة عبر منصة SYNC لشروط الاستخدام. لا يمكن استرداد المبلغ أو إلغاء الاشتراك بعد التفعيل واستلام بيانات الحساب أو مفتاح التفعيل. يرجى التأكد من قراءة مواصفات الباقة جيداً قبل إتمام عملية الدفع. في حال وجود أي مشكلة تقنية، الدعم الفني متاح لمساعدتك خلال فترة الضمان الموضحة.') : (plan.custom_policies_en || 'All subscriptions and digital products sold through the SYNC platform are subject to our terms of use. Refunds or cancellations are not available after activation and receipt of account details or activation keys. Please ensure you read the package specifications carefully before completing the payment. In case of any technical issues, technical support is available to assist you during the stated warranty period.'),
    activation: lang === 'ar' ? (plan.custom_activation_ar || 'بعد إتمام الدفع، سيصلك بريد إلكتروني يحتوي على مفتاح التفعيل ورابط مباشر لتحميل أو الوصول للأداة فوراً.') : (plan.custom_activation_en || 'After completing the payment, you will receive an email containing the activation key and a direct link to access the tool immediately.'),
    payment: lang === 'ar' ? 'نحن ندعم وسائل الدفع الآمنة بما في ذلك البطاقات الائتمانية، باي بال، ووسائل الدفع المحلية حسب دولتك.' : 'We support secure payment methods including credit cards, PayPal, and local payment methods depending on your country.'
  };

  const convertedPrice = (Number(plan.price_usd) * currency.rate).toFixed(2);
  const convertedOriginal = plan.original_price_usd ? (Number(plan.original_price_usd) * currency.rate).toFixed(2) : null;
  const convertedStoreOld = plan.store_original_price_usd ? (Number(plan.store_original_price_usd) * currency.rate).toFixed(2) : null;

  // Parse features from jsonb
  const features: string[] = Array.isArray(plan.features) ? plan.features : [];

  return (
    <div className={`flex flex-col relative ${!plan.is_active ? 'opacity-45 hover:opacity-75 transition-opacity' : ''}`} style={{ perspective: '1500px' }}>
      {/* Physical Gift Card */}
      <div 
        className="relative transition-all duration-700 hover:-translate-y-4 cursor-pointer mb-8"
        style={{ height: '540px', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Face */}
        <div 
          className="absolute inset-0 w-full rounded-4xl overflow-hidden flex flex-col transition-all duration-500"
          style={{
            background: 'linear-gradient(180deg, var(--sync-surface) 0%, var(--sync-bg-elevated) 100%)',
            border: plan.is_highlighted ? '2px solid var(--sync-yellow)' : '1px solid var(--sync-border)',
            boxShadow: plan.is_highlighted ? 'var(--sync-shadow-featured)' : 'var(--sync-shadow)',
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
            <p style={{ color: 'var(--sync-yellow)' }} className="text-sm font-semibold tracking-wide uppercase">{planTitle}</p>
          </div>

          {/* Middle Holographic Ticket */}
          <div className="px-6 py-2 grow flex min-h-0">
            <div className="w-full h-full rounded-xl border flex flex-col items-center justify-center relative overflow-hidden shadow-inner" 
                style={{ 
                  borderColor: 'rgba(255,194,26,0.3)',
                  background: 'var(--sync-bg-elevated)'
                }}>
              <div className="absolute inset-0 opacity-20 mix-blend-overlay z-10" style={{ background: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")', pointerEvents: 'none' }}></div>
              {plan.mini_card_url ? (
                <img src={plan.mini_card_url} alt="Products" className="w-full h-full object-cover relative z-0 sync-light-image-filter" />
              ) : (
                <TicketSVG slug={tool.slug} name={tool.name} lang={lang} plan={plan} />
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="px-8 pb-8 pt-4 flex justify-between items-center mt-auto shrink-0 relative gap-2">
            {convertedOriginal ? (
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: 'var(--sync-text-primary)', opacity: 0.7 }}>
                  {lang === 'ar' ? 'القيمة الأصلية' : 'ORIGINAL VALUE'}
                </p>
                <p className="text-2xl font-medium relative inline-block self-start" style={{ color: 'var(--sync-text-primary)', opacity: 0.8 }}>
                  {currency.symbol}{convertedOriginal}
                  <span className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500/80 -rotate-12"></span>
                </p>
              </div>
            ) : <div className="flex-1" />}
            
            {(plan.has_extra_discount || convertedStoreOld) && (
              <div className="shrink-0 flex flex-col items-center justify-center">
                <div className="bg-red-500/10 border border-red-500/30 rounded px-2.5 py-1.5 flex flex-col items-center justify-center min-w-[90px]">
                  <span className="text-red-500 text-[9px] font-black tracking-widest uppercase whitespace-nowrap mb-0.5">
                    {convertedStoreOld 
                      ? (lang === 'ar' ? 'سعرنا القديم' : 'OUR OLD PRICE') 
                      : (lang === 'ar' ? 'خصم إضافي' : 'EXTRA DISCOUNT')}
                  </span>
                  {convertedStoreOld && (
                    <span className="text-sm font-bold relative inline-block opacity-90 mt-0.5" style={{ color: 'var(--sync-text-primary)' }}>
                      {currency.symbol}{convertedStoreOld}
                      <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-500/80 -rotate-12"></span>
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="text-right flex flex-col items-end flex-1">
              <div className="flex items-center gap-2 mb-1 justify-end w-full">
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: plan.is_highlighted ? '#4ade80' : 'var(--sync-yellow)' }}>
                  {lang === 'ar' ? 'فقط' : 'ONLY'}
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-xl md:text-2xl font-bold mt-1" style={{ color: plan.is_highlighted ? '#4ade80' : 'var(--sync-yellow)' }}>{currency.symbol}</span>
                <span className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: plan.is_highlighted ? '#4ade80' : 'var(--sync-yellow)', lineHeight: '1' }}>
                  {convertedPrice.split('.')[0]}
                </span>
                {convertedPrice.includes('.') && (
                  <span className="text-xl md:text-2xl font-bold" style={{ color: plan.is_highlighted ? '#4ade80' : 'var(--sync-yellow)' }}>
                    .{convertedPrice.split('.')[1]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div 
          className="absolute inset-0 w-full rounded-4xl overflow-hidden flex flex-col p-8 transition-all duration-500"
          style={{
            background: 'linear-gradient(180deg, var(--sync-bg-elevated) 0%, var(--sync-surface) 100%)',
            border: plan.is_highlighted ? '2px solid var(--sync-yellow)' : '1px solid var(--sync-border)',
            boxShadow: plan.is_highlighted ? 'var(--sync-shadow-featured)' : 'var(--sync-shadow)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            pointerEvents: isFlipped ? 'auto' : 'none'
          }}
        >
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-3 rounded-full border border-[rgba(255,255,255,0.05)] shadow-inner z-20" style={{ background: 'var(--sync-bg)', opacity: 0.9 }}></div>
          
          {/* Stock Badge */}
          <div className="absolute top-4 left-4 z-20">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${isOutOfStock ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
              {isOutOfStock ? (lang === 'ar' ? 'نفذت الكمية' : 'Out of Stock') : (lang === 'ar' ? (plan.delivery_type !== 'user_provides_email' ? `متاح: ${availableStock}` : 'متاح دائماً') : (plan.delivery_type !== 'user_provides_email' ? `${availableStock} in Stock` : 'Always Available'))}
            </span>
          </div>
          {/* Units Sold Badge */}
          <div className="absolute top-4 right-4 z-20">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[rgba(255,194,26,0.12)] border border-[rgba(255,194,26,0.25)]" style={{ color: 'var(--sync-yellow)' }}>
              {lang === 'ar' ? `${plan.units_sold || 0} تم بيعها` : `${plan.units_sold || 0} Sold`}
            </span>
          </div>

          <div className="flex justify-center mt-6 mb-4">
            <img src="/sync-logo.png" alt="SYNC" className="h-8 w-auto object-contain opacity-50 grayscale" />
          </div>
          
          <h4 className="text-xl font-bold text-center mb-4 uppercase tracking-widest" style={{ color: 'var(--sync-text-primary)' }}>{lang === 'ar' ? 'مميزات الباقة' : 'Plan Features'}</h4>
          
          <div className="grow flex flex-col justify-start overflow-hidden">
            <div className="overflow-y-auto pr-2 pb-2 mb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              <ul className="space-y-3">
                {features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full shrink-0" style={{ background: 'rgba(255,194,26,0.1)' }}>
                      <CheckCircle className="w-3 h-3" style={{ color: 'var(--sync-yellow)' }} />
                    </div>
                    <span style={{ color: 'var(--sync-text-primary)' }} className="opacity-90 font-medium text-xs text-left">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button 
              type="button"
              className="mt-auto shrink-0 w-full py-2.5 rounded-lg border border-(--sync-border) bg-black/5 hover:bg-black/10 transition-all flex items-center justify-center gap-2 group"
              onClick={(e) => { e.stopPropagation(); setActiveModal('details_activation'); }}
            >
              <Info className="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" style={{ color: 'var(--sync-yellow)' }} />
              <span className="text-xs font-bold opacity-80" style={{ color: 'var(--sync-text-primary)' }}>
                {lang === 'ar' ? 'التفاصيل وطريقة التفعيل' : 'Details & Activation Method'}
              </span>
            </button>
          </div>
          

          {/* Policy Snippet */}
          <div className="mt-4 mb-2 shrink-0 pt-3 border-t border-white/5 flex flex-col items-center">
             <p className="text-[10px] opacity-70 mb-3 leading-relaxed text-center line-clamp-2" style={{ color: 'var(--sync-text-primary)' }}>
               {lang === 'ar' ? (plan.custom_policies_ar || 'تخضع جميع الاشتراكات والمنتجات الرقمية المباعة عبر منصة SYNC لشروط الاستخدام. لا يمكن استرداد المبلغ أو إلغاء الاشتراك بعد التفعيل. يرجى التأكد من الباقة قبل الدفع.') : (plan.custom_policies_en || 'All subscriptions and digital products sold through SYNC are subject to our terms. Refunds are not available after activation. Please ensure you select the appropriate plan.')}
             </p>
             <button 
               type="button" 
               onClick={(e) => { e.stopPropagation(); setActiveModal('policies'); }} 
               className="px-4 py-1.5 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 transition-all border border-(--sync-border) hover:bg-black/5 w-fit cursor-pointer" 
               style={{ color: 'var(--sync-text-primary)' }}
             >
               <FileText className="w-3 h-3" style={{ color: 'var(--sync-yellow)' }} />
               {lang === 'ar' ? 'اقرأ السياسة الكاملة' : 'Read Full Policy'}
             </button>
          </div>

          {/* Action Button */}
          <button 
            disabled={isOutOfStock || !plan.is_active}
            className={`w-full py-4 mt-6 rounded-xl font-bold text-lg transition-all duration-300 ${(isOutOfStock || !plan.is_active) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'} shadow-[0_0_20px_rgba(0,0,0,0.2)] relative overflow-hidden group/btn z-30 shrink-0 flex items-center justify-center gap-2`} 
            style={{ background: plan.is_highlighted ? 'var(--sync-yellow)' : 'var(--sync-surface)', color: plan.is_highlighted ? '#0B132B' : 'var(--sync-text-primary)', border: plan.is_highlighted ? 'none' : '1px solid var(--sync-yellow)' }}
            onClick={(e) => { e.stopPropagation(); if (!isOutOfStock && plan.is_active) onAddToCart(); }}
          >
            <ShoppingCart className="w-5 h-5 relative z-10" />
            <span className="relative z-10">
              {!plan.is_active
                ? (lang === 'ar' ? 'غير متوفر' : 'Unavailable')
                : isOutOfStock 
                  ? (lang === 'ar' ? 'نفذت الكمية' : 'Out of Stock') 
                  : (lang === 'ar' ? 'أضف للسلة' : 'Add to Cart')}
            </span>
            <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300" style={{ background: plan.is_highlighted ? '#fff' : 'var(--sync-yellow)' }} />
          </button>
        </div>
      </div>
      {/* Modal Overlay */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in"
          style={{ background: 'rgba(8, 11, 20, 0.65)' }}
          onClick={(e) => { e.stopPropagation(); setActiveModal(null); }}
        >
          <div 
            className="rounded-2xl p-6 md:p-8 max-w-lg w-full animate-in zoom-in-95 border border-(--sync-border)"
            style={{ 
              background: 'linear-gradient(145deg, var(--sync-surface) 0%, var(--sync-bg-elevated) 100%)',
              boxShadow: 'var(--sync-shadow)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-(--sync-text-primary) tracking-wider">{modalTitles[activeModal]}</h3>
              <button onClick={(e) => { e.stopPropagation(); setActiveModal(null); }} className="text-(--sync-text-dim) hover:text-(--sync-text-primary) transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-(--sync-text) leading-relaxed text-sm md:text-base">
               {modalContents[activeModal]}
            </div>
            <button 
              className="w-full mt-8 py-3 rounded-xl font-bold transition-colors bg-(--sync-yellow) text-[#0B132B] hover:bg-(--sync-bg-elevated) border border-(--sync-border)"
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
  const { addItem } = useSyncCart();
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCIES[0]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const supabase = createSyncClient();
        
        const { data: ratesData, error: ratesError } = await supabase.from('exchange_rates').select('*');
        if (ratesError) console.error("Exchange rates fetch error:", ratesError);
        
        if (ratesData && ratesData.length > 0) {
          const dynamicCurrencies = [
            { code: 'USD', symbol: '$', rate: 1, label: 'USD ($)' },
            ...ratesData.map(r => ({
              code: r.currency_code,
              symbol: r.symbol || r.currency_code,
              rate: Number(r.rate_to_usd),
              label: r.label || `${r.currency_code} (${r.symbol || r.currency_code})`
            }))
          ];
          setCurrencies(dynamicCurrencies);
          setSelectedCurrency(prev => {
            const match = dynamicCurrencies.find(c => c.code === prev.code);
            return match || dynamicCurrencies[0];
          });
        }

        const { data, error } = await supabase
          .from('products')
          .select(`
            id, slug, name, description_en, description_ar, cover_image_url,
            plans(id, title_en, title_ar, price_usd, original_price_usd, store_original_price_usd, duration_days, is_highlighted, has_extra_discount, is_active, discount_label, features, sort_order, delivery_type, stock_count, units_sold, mini_card_url)
          `)
          .eq('slug', unwrappedParams.slug)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (data) {
          // Sort plans by sort_order, keeping inactive ones to render as dimmed
          const sortedPlans = (data.plans || [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order);
          const sorted = { ...data, plans: sortedPlans };
          setProduct(sorted as unknown as Product);
        } else {
          setProduct(null);
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [unwrappedParams.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--sync-yellow)' }} />
      </div>
    );
  }

  if (!product) {
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

  return (
    <div className="pt-32 pb-24 min-h-screen relative z-10 overflow-hidden" style={{ background: 'var(--sync-bg)' }}>
      {/* Dynamic Background Image & Glow */}
      {product.cover_image_url ? (
        <div className="absolute top-0 left-0 right-0 h-[60vh] z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(11, 19, 43, 0.4) 0%, var(--sync-bg) 100%)' }} />
          <div className="absolute inset-0 z-10 opacity-60" style={{ background: 'var(--sync-bg)' }} />
          <img src={product.cover_image_url} alt={product.name} className="w-full h-full object-cover opacity-50 mix-blend-screen blur-[2px] sync-light-image-filter" />
        </div>
      ) : (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 opacity-20 pointer-events-none blur-[120px]" style={{ background: 'radial-gradient(circle, var(--sync-yellow) 0%, transparent 70%)' }} />
      )}

      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 2xl:px-24 relative z-10">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full transition-all backdrop-blur-md relative z-20 sync-back-link" style={{ background: 'var(--sync-bg-elevated)', color: 'var(--sync-text-primary)', border: '1px solid var(--sync-border)' }}>
          {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span className="font-semibold text-sm">{lang === 'ar' ? 'الرجوع للعروض' : 'Back to Deals'}</span>
        </Link>

        {/* Hero Section for Tool */}
        <div className="flex flex-col items-center gap-6 mb-20 text-center relative z-20 mt-4">
          <div className={product.cover_image_url ? "mt-0" : "mt-4"}>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-lg" style={{ color: 'var(--sync-text-primary)' }}>{product.name}</h1>
            <p className="text-xl md:text-2xl opacity-80 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--sync-text-primary)' }}>
              {lang === 'ar' ? product.description_ar : product.description_en}
            </p>
          </div>
        </div>

        {/* Plans Grid Header & Currency Selector */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 relative z-30">
          <div className="md:w-1/3 hidden md:block"></div>
          
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
                onChange={(e) => setSelectedCurrency(currencies.find(c => c.code === e.target.value) || currencies[0])}
                className="appearance-none outline-none py-3 px-6 pr-12 rounded-xl font-bold cursor-pointer transition-all duration-300 hover:scale-105"
                style={{ 
                  background: 'var(--sync-surface)', 
                  color: 'var(--sync-text-primary)',
                  border: '1px solid var(--sync-border)',
                  boxShadow: 'var(--sync-shadow)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code} style={{ background: 'var(--sync-bg-elevated)', color: 'var(--sync-text-primary)' }}>
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
          {product.plans.map((plan) => (
            <GiftCard 
              key={plan.id} 
              plan={plan} 
              tool={product} 
              lang={lang} 
              currency={selectedCurrency}
              onAddToCart={() => addItem({
                planId: plan.id,
                productId: product.id,
                productName: product.name,
                productSlug: product.slug,
                planTitle: lang === 'ar' ? plan.title_ar : plan.title_en,
                priceUsd: Number(plan.price_usd),
                originalPriceUsd: plan.original_price_usd ? Number(plan.original_price_usd) : null,
                storeOriginalPriceUsd: plan.store_original_price_usd ? Number(plan.store_original_price_usd) : null,
                durationDays: plan.duration_days,
                coverImageUrl: product.cover_image_url,
              })}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
