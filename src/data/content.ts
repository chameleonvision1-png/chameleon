// ============================================
// CHAMELEON — Central Content Data Store
// All placeholder data for every section
// ============================================

export const siteConfig = {
  name: "Chameleon",
  nameAr: "كاميليون",
  tagline: "يتكيف مع عالمك الرقمي",
  taglineEn: "Adapts to your Digital World",
  description:
    "منصة رقمية متكاملة تقدم خدمات تصميم المواقع، السوشيال ميديا ماركتنج، أدوات الذكاء الاصطناعي، وحلول المؤسسات.",
  copyright: `© ${new Date().getFullYear()} Chameleon. All Rights Reserved.`,
};

// Social media platforms with their brand colors
export const socialPlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    color: "#E4405F",
    gradient: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
    icon: "instagram",
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "#69C9D0",
    gradient: "linear-gradient(135deg, #69C9D0, #EE1D52, #010101)",
    icon: "tiktok",
  },
  {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    gradient: "radial-gradient(circle, #FF0000, #8B0000)",
    icon: "youtube",
  },
  {
    id: "x",
    name: "X",
    color: "#E7E9EA",
    gradient: "radial-gradient(circle, #333333, #1a1a1a)",
    icon: "x",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    color: "#FFFC00",
    gradient: "radial-gradient(circle, #FFFC00, #F7E600)",
    icon: "snapchat",
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    gradient: "radial-gradient(circle, #1877F2, #0D47A1)",
    icon: "facebook",
  },
];

// Navigation links
export const navLinks = [
  { label: "الخدمات", href: "#services" },
  { label: "أعمالنا", href: "#portfolio" },
  { label: "السوشيال ميديا", href: "#smm" },
  { label: "أدوات AI", href: "#ai-tools" },
  { label: "حلول المؤسسات", href: "#enterprise" },
  { label: "تواصل معنا", href: "#contact" },
];

// Portfolio items
export const portfolioItems = [
  {
    id: 1,
    title: "متجر إلكتروني فاخر",
    titleEn: "Luxury E-Commerce",
    description: "تصميم وتطوير متجر إلكتروني متكامل بتجربة مستخدم راقية",
    url: "https://example.com",
    image: "/images/portfolio/1.png",
  },
  {
    id: 2,
    title: "منصة تعليمية",
    titleEn: "EdTech Platform",
    description: "منصة تعليمية تفاعلية مع نظام إدارة محتوى متقدم",
    url: "https://example.com",
    image: "/images/portfolio/2.png",
  },
  {
    id: 3,
    title: "تطبيق صحي",
    titleEn: "Health App",
    description: "تطبيق ويب لإدارة المواعيد الطبية والسجلات الصحية",
    url: "https://example.com",
    image: "/images/portfolio/3.png",
  },
  {
    id: 4,
    title: "بوابة عقارات",
    titleEn: "Real Estate Portal",
    description: "منصة عقارية بخريطة تفاعلية وبحث ذكي",
    url: "https://example.com",
    image: "/images/portfolio/4.png",
  },
];

// SMM Services
export const smmServices = [
  {
    id: 1,
    platform: "instagram",
    name: "زيادة متابعين",
    nameEn: "Followers Growth",
    tiers: [
      { name: "Basic", price: "500 EGP", count: "1K" },
      { name: "Pro", price: "1,200 EGP", count: "5K" },
      { name: "Premium", price: "3,000 EGP", count: "15K" },
    ],
  },
  {
    id: 2,
    platform: "instagram",
    name: "حملات إعلانية",
    nameEn: "Ad Campaigns",
    tiers: [
      { name: "Basic", price: "2,000 EGP", count: "7 أيام" },
      { name: "Pro", price: "5,000 EGP", count: "15 يوم" },
      { name: "Premium", price: "12,000 EGP", count: "30 يوم" },
    ],
  },
  {
    id: 3,
    platform: "tiktok",
    name: "زيادة متابعين",
    nameEn: "Followers Growth",
    tiers: [
      { name: "Basic", price: "400 EGP", count: "1K" },
      { name: "Pro", price: "1,000 EGP", count: "5K" },
      { name: "Premium", price: "2,500 EGP", count: "15K" },
    ],
  },
  {
    id: 4,
    platform: "tiktok",
    name: "تصميم ريلز",
    nameEn: "Reels Design",
    tiers: [
      { name: "Basic", price: "800 EGP", count: "3 ريلز" },
      { name: "Pro", price: "2,000 EGP", count: "8 ريلز" },
      { name: "Premium", price: "4,500 EGP", count: "20 ريلز" },
    ],
  },
  {
    id: 5,
    platform: "youtube",
    name: "إدارة قناة",
    nameEn: "Channel Management",
    tiers: [
      { name: "Basic", price: "3,000 EGP", count: "شهرياً" },
      { name: "Pro", price: "6,000 EGP", count: "شهرياً" },
      { name: "Premium", price: "12,000 EGP", count: "شهرياً" },
    ],
  },
  {
    id: 6,
    platform: "facebook",
    name: "إدارة حساب",
    nameEn: "Account Management",
    tiers: [
      { name: "Basic", price: "1,500 EGP", count: "شهرياً" },
      { name: "Pro", price: "3,500 EGP", count: "شهرياً" },
      { name: "Premium", price: "7,000 EGP", count: "شهرياً" },
    ],
  },
  {
    id: 7,
    platform: "snapchat",
    name: "حملات إعلانية",
    nameEn: "Ad Campaigns",
    tiers: [
      { name: "Basic", price: "2,500 EGP", count: "7 أيام" },
      { name: "Pro", price: "5,500 EGP", count: "15 يوم" },
      { name: "Premium", price: "13,000 EGP", count: "30 يوم" },
    ],
  },
  {
    id: 8,
    platform: "x",
    name: "تصميم محتوى",
    nameEn: "Content Design",
    tiers: [
      { name: "Basic", price: "1,000 EGP", count: "10 بوستات" },
      { name: "Pro", price: "2,500 EGP", count: "25 بوست" },
      { name: "Premium", price: "5,000 EGP", count: "50 بوست" },
    ],
  },
];

// AI Tools & Software Deals
export const aiTools = [
  {
    id: 1,
    name: "Gemini Advanced",
    originalPrice: "$20/mo",
    salePrice: "$8/mo",
    discount: 60,
    bestOffer: true,
    description: "أقوى نماذج Google للذكاء الاصطناعي",
  },
  {
    id: 2,
    name: "Canva Pro",
    originalPrice: "$13/mo",
    salePrice: "$5/mo",
    discount: 62,
    bestOffer: true,
    description: "تصميم احترافي بدون خبرة",
  },
  {
    id: 3,
    name: "Adobe Creative Cloud",
    originalPrice: "$55/mo",
    salePrice: "$20/mo",
    discount: 64,
    bestOffer: false,
    description: "الحزمة الكاملة من أدوات Adobe",
  },
  {
    id: 4,
    name: "Midjourney",
    originalPrice: "$30/mo",
    salePrice: "$12/mo",
    discount: 60,
    bestOffer: false,
    description: "تصميم صور بالذكاء الاصطناعي",
  },
  {
    id: 5,
    name: "ChatGPT Plus",
    originalPrice: "$20/mo",
    salePrice: "$9/mo",
    discount: 55,
    bestOffer: false,
    description: "المساعد الذكي الأشهر في العالم",
  },
  {
    id: 6,
    name: "Notion AI",
    originalPrice: "$10/mo",
    salePrice: "$4/mo",
    discount: 60,
    bestOffer: false,
    description: "إدارة مشاريع مدعومة بالذكاء الاصطناعي",
  },
];

// Enterprise Solutions
export const enterpriseSolutions = [
  {
    id: 1,
    title: "التوجيه الداخلي",
    titleEn: "Indoor Navigation",
    description: "خرائط تفاعلية ثلاثية الأبعاد للمولات والمستشفيات والجامعات مع نظام توجيه ذكي",
    icon: "map-pin",
  },
  {
    id: 2,
    title: "شاشات العرض التفاعلية",
    titleEn: "Interactive Kiosks",
    description: "تطوير واجهات احترافية للشاشات التفاعلية (Kiosks) في المراكز التجارية والمؤسسات",
    icon: "monitor",
  },
  {
    id: 3,
    title: "أنظمة إدارية",
    titleEn: "ERP / CRM Systems",
    description: "حلول ERP و CRM مخصصة بالكامل لاحتياجات مؤسستك مع لوحات تحكم متقدمة",
    icon: "building",
  },
];

// Digital Assets categories
export const assetCategories = [
  { id: "ui", label: "عناصر UI", labelEn: "UI Kits" },
  { id: "code", label: "أكواد جاهزة", labelEn: "Code Snippets" },
  { id: "3d", label: "موديلات 3D", labelEn: "3D Models" },
];

export const digitalAssets: Record<"ui" | "code" | "3d", { name: string; type: string; price: string; isFree: boolean }[]> = {
  ui: [
    { name: "Dashboard UI Kit", type: "Figma", price: "Free", isFree: true },
    { name: "E-Commerce Components", type: "Sketch", price: "250 EGP", isFree: false },
    { name: "Mobile App Starter", type: "Figma", price: "400 EGP", isFree: false },
  ],
  code: [
    { name: "Auth System (Next.js)", type: "TypeScript", price: "500 EGP", isFree: false },
    { name: "REST API Boilerplate", type: "Node.js", price: "Free", isFree: true },
    { name: "Dashboard Template", type: "React", price: "350 EGP", isFree: false },
  ],
  "3d": [
    { name: "Modern Office Pack", type: "Blender", price: "800 EGP", isFree: false },
    { name: "Product Display Stand", type: "FBX", price: "350 EGP", isFree: false },
    { name: "Architectural Scene", type: "OBJ", price: "Free", isFree: true },
  ],
};

export const logoPortfolio = [
  { id: 1, name: "Nova Tech", category: "Technology" },
  { id: 2, name: "مطعم الأصيل", category: "F&B" },
  { id: 3, name: "Apex Fitness", category: "Sports" },
  { id: 4, name: "دار المعرفة", category: "Education" },
  { id: 5, name: "Cloud Nine", category: "Hospitality" },
  { id: 6, name: "الريادة", category: "Business" },
];

