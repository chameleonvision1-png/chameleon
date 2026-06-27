import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const dir = 'public/sync/covers';
try {
  mkdirSync(dir, { recursive: true });
} catch (e) {}

// Premium clean SVGs styled like Canva/Grok
// Dark blue background gradient (#050918 to #0d152d)
// Large centered logo/icon in Yellow (#FFC21A) and Blue (#3B82F6)
const SVGS = {
  'cursor': {
    // Sleek cursor arrow pointing up-left with code brackets
    icon: `
      <!-- Glow behind logo -->
      <circle cx="400" cy="225" r="120" fill="#3B82F6" opacity="0.15" filter="url(#blur)" />
      <!-- Left Bracket -->
      <path d="M 280 165 L 240 225 L 280 285" stroke="#3B82F6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <!-- Right Bracket -->
      <path d="M 520 165 L 560 225 L 520 285" stroke="#3B82F6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <!-- Cursor Arrow -->
      <path d="M 360 140 L 460 270 L 405 285 L 445 365 L 395 390 L 355 310 L 310 330 Z" fill="#FFC21A" filter="url(#glow)" />
    `
  },
  'replit': {
    // Replit interlocking logo blocks
    icon: `
      <circle cx="400" cy="225" r="120" fill="#FFC21A" opacity="0.1" filter="url(#blur)" />
      <!-- Left part -->
      <path d="M 330 140 L 270 140 L 270 310 L 330 310 L 330 250 L 390 250 L 390 200 L 330 200 Z" fill="#FFC21A" filter="url(#glow)" />
      <!-- Right part -->
      <path d="M 470 140 L 530 140 L 530 310 L 470 310 L 470 250 L 410 250 L 410 200 L 470 200 Z" fill="#3B82F6" filter="url(#glow)" />
    `
  },
  'lovable-ai': {
    // Beautiful glowing heart with digital nodes
    icon: `
      <circle cx="400" cy="225" r="120" fill="#3B82F6" opacity="0.15" filter="url(#blur)" />
      <path d="M 400 340 C 310 270 260 200 260 150 C 260 100 310 70 360 100 C 400 125 400 125 400 125 C 400 125 400 125 440 100 C 490 70 540 100 540 150 C 540 200 490 270 400 340 Z" fill="#FFC21A" filter="url(#glow)" />
      <circle cx="350" cy="140" r="10" fill="#3B82F6" />
      <circle cx="450" cy="140" r="10" fill="#3B82F6" />
      <circle cx="400" cy="230" r="12" fill="#FFFFFF" />
      <path d="M 350 140 L 400 230 L 450 140" stroke="#3B82F6" stroke-width="4" opacity="0.7" />
    `
  },
  'manus-pro': {
    // Futuristic agent M symbol inside a golden circle
    icon: `
      <circle cx="400" cy="225" r="130" stroke="#3B82F6" stroke-width="8" stroke-dasharray="15 10" fill="none" opacity="0.4" />
      <circle cx="400" cy="225" r="110" stroke="#FFC21A" stroke-width="12" fill="none" filter="url(#glow)" />
      <!-- Futuristic M -->
      <path d="M 330 280 L 330 170 L 400 240 L 470 170 L 470 280" stroke="#FFC21A" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#glow)" />
    `
  },
  'openart': {
    // Artist palette / creative infinite swirl
    icon: `
      <circle cx="400" cy="225" r="120" fill="#3B82F6" opacity="0.15" filter="url(#blur)" />
      <!-- Palette shape -->
      <path d="M 280 225 C 280 150 330 110 400 110 C 470 110 520 160 520 225 C 520 290 460 340 400 340 C 350 340 330 310 310 310 C 290 310 280 290 280 225 Z" fill="none" stroke="#FFC21A" stroke-width="16" stroke-linejoin="round" filter="url(#glow)" />
      <!-- Color dots -->
      <circle cx="340" cy="180" r="18" fill="#3B82F6" />
      <circle cx="400" cy="160" r="18" fill="#FFC21A" />
      <circle cx="460" cy="190" r="18" fill="#FFFFFF" />
      <circle cx="450" cy="260" r="18" fill="#3B82F6" opacity="0.7" />
    `
  },
  'kiromax': {
    // Bold lightning bolt inside a clean hexagon
    icon: `
      <circle cx="400" cy="225" r="120" fill="#3B82F6" opacity="0.15" filter="url(#blur)" />
      <!-- Hexagon -->
      <polygon points="400,100 520,170 520,310 400,380 280,310 280,170" fill="none" stroke="#3B82F6" stroke-width="10" stroke-linejoin="round" />
      <!-- Lightning bolt -->
      <path d="M 420 130 L 320 230 L 390 230 L 360 330 L 480 210 L 410 210 Z" fill="#FFC21A" filter="url(#glow)" />
    `
  },
  'telegram': {
    // Premium paper plane inside circular badge
    icon: `
      <circle cx="400" cy="225" r="110" fill="#3B82F6" />
      <circle cx="400" cy="225" r="110" stroke="#FFC21A" stroke-width="8" fill="none" filter="url(#glow)" />
      <!-- Paper Plane -->
      <path d="M 290 220 L 490 130 L 430 310 L 380 250 Z" fill="#FFC21A" filter="url(#glow)" />
      <path d="M 380 250 L 490 130" stroke="#050918" stroke-width="4" stroke-linecap="round" />
      <path d="M 380 250 L 290 220" stroke="#050918" stroke-width="4" stroke-linecap="round" />
    `
  },
  'nordvpn': {
    // Shield with a mountain peak inside
    icon: `
      <circle cx="400" cy="225" r="120" fill="#3B82F6" opacity="0.15" filter="url(#blur)" />
      <!-- Shield -->
      <path d="M 300 130 L 500 130 L 520 220 C 520 290 400 340 400 340 C 400 340 280 290 280 220 Z" fill="none" stroke="#3B82F6" stroke-width="12" stroke-linejoin="round" />
      <!-- Mountain Peak -->
      <path d="M 340 250 L 400 160 L 460 250 M 380 250 L 400 210 L 420 250" fill="none" stroke="#FFC21A" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />
    `
  },
  'spotify': {
    // Circular spotify sound waves
    icon: `
      <circle cx="400" cy="225" r="120" fill="#FFC21A" opacity="0.1" filter="url(#blur)" />
      <circle cx="400" cy="225" r="110" stroke="#FFC21A" stroke-width="12" fill="none" filter="url(#glow)" />
      <!-- Soundwaves -->
      <path d="M 330 185 Q 400 155 470 185" fill="none" stroke="#3B82F6" stroke-width="12" stroke-linecap="round" />
      <path d="M 315 225 Q 400 195 485 225" fill="none" stroke="#3B82F6" stroke-width="12" stroke-linecap="round" />
      <path d="M 330 265 Q 400 235 470 265" fill="none" stroke="#3B82F6" stroke-width="12" stroke-linecap="round" />
    `
  },
  'netflix': {
    // Beautiful gold glowing N ribbon
    icon: `
      <circle cx="400" cy="225" r="120" fill="#FFC21A" opacity="0.1" filter="url(#blur)" />
      <!-- Left ribbon vertical -->
      <path d="M 330 110 L 330 340" stroke="#3B82F6" stroke-width="32" stroke-linecap="square" />
      <!-- Right ribbon vertical -->
      <path d="M 470 110 L 470 340" stroke="#3B82F6" stroke-width="32" stroke-linecap="square" />
      <!-- Diagonal overlay ribbon -->
      <path d="M 330 110 L 470 340" stroke="#FFC21A" stroke-width="34" stroke-linecap="square" filter="url(#glow)" />
    `
  },
  'figma': {
    // Figma grid drops
    icon: `
      <circle cx="400" cy="225" r="120" fill="#3B82F6" opacity="0.15" filter="url(#blur)" />
      <!-- Left top circle -->
      <path d="M 370 110 C 395 110 415 130 415 155 C 415 180 395 200 370 200 L 325 200 L 325 110 Z" fill="#3B82F6" />
      <!-- Left mid circle -->
      <path d="M 370 200 C 395 200 415 220 415 245 C 415 270 395 290 370 290 L 325 290 L 325 200 Z" fill="#FFC21A" filter="url(#glow)" />
      <!-- Right top circle -->
      <path d="M 430 110 C 455 110 475 130 475 155 C 475 180 455 200 430 200 Z" fill="#3B82F6" />
      <!-- Right mid circle -->
      <path d="M 430 200 C 455 200 475 220 475 245 C 475 270 455 290 430 290 Z" fill="#FFC21A" filter="url(#glow)" />
      <!-- Left bottom drop -->
      <path d="M 370 290 C 395 290 415 310 415 335 C 415 360 395 380 370 380 C 345 380 325 360 325 335 C 325 310 345 290 370 290 Z" fill="#3B82F6" />
    `
  },
  'prime-video': {
    // Play button with smile arrow
    icon: `
      <circle cx="400" cy="225" r="120" fill="#3B82F6" opacity="0.15" filter="url(#blur)" />
      <!-- Play Triangle -->
      <polygon points="350,130 490,215 350,300" fill="none" stroke="#3B82F6" stroke-width="16" stroke-linejoin="round" />
      <!-- Smile Arrow -->
      <path d="M 310 330 Q 400 375 490 330" fill="none" stroke="#FFC21A" stroke-width="12" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 460 340 L 490 330 L 480 300" fill="none" stroke="#FFC21A" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />
    `
  },
  'perplexity': {
    // Perplexity book/asterisk flower
    icon: `
      <circle cx="400" cy="225" r="120" fill="#FFC21A" opacity="0.1" filter="url(#blur)" />
      <!-- Asterisk paths -->
      <path d="M 310 135 C 310 85 390 85 400 135 C 410 85 490 85 490 135 C 490 185 410 185 400 135 C 390 185 310 185 310 185 Z" fill="none" stroke="#3B82F6" stroke-width="10" />
      <path d="M 310 315 C 310 265 390 265 400 315 C 410 265 490 265 490 315 C 490 365 410 365 400 315 C 390 365 310 365 310 315 Z" fill="none" stroke="#3B82F6" stroke-width="10" />
      <!-- Central core -->
      <circle cx="400" cy="225" r="30" fill="#FFC21A" filter="url(#glow)" />
      <circle cx="400" cy="225" r="10" fill="#FFFFFF" />
    `
  },
  'railway': {
    // Railway logo grid tracks
    icon: `
      <circle cx="400" cy="225" r="120" fill="#3B82F6" opacity="0.15" filter="url(#blur)" />
      <!-- Main tracks -->
      <path d="M 260 175 L 540 175 M 260 275 L 540 275" stroke="#3B82F6" stroke-width="16" stroke-linecap="round" />
      <!-- Crossbars -->
      <path d="M 310 130 L 310 320 M 400 130 L 400 320 M 490 130 L 490 320" stroke="#FFC21A" stroke-width="16" stroke-linecap="round" filter="url(#glow)" />
    `
  },
  'adobe': {
    // Adobe stylized A triangle
    icon: `
      <circle cx="400" cy="225" r="120" fill="#FFC21A" opacity="0.1" filter="url(#blur)" />
      <path d="M 400 100 L 510 330 L 460 330 L 400 200 L 340 330 L 290 330 Z" fill="#FFC21A" filter="url(#glow)" />
      <path d="M 340 260 L 460 260" stroke="#3B82F6" stroke-width="16" stroke-linecap="round" />
    `
  }
};

for (const [slug, item] of Object.entries(SVGS)) {
  const content = `<svg width="800" height="450" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Premium background matching Canva style -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050918" />
      <stop offset="100%" stop-color="#0D152D" />
    </linearGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" />
    </filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  
  <!-- Solid Premium Background -->
  <rect width="800" height="450" fill="url(#bgGrad)" />
  
  <!-- Subtle Elegant Outer Border (Like Canva) -->
  <rect x="25" y="25" width="750" height="400" rx="15" fill="none" stroke="#FFC21A" stroke-width="2" opacity="0.15" />
  
  <!-- Centered Logo Group -->
  <g>
    ${item.icon}
  </g>
</svg>`;

  const filename = join(dir, `${slug}.svg`);
  writeFileSync(filename, content);
  console.log(`Generated: ${filename}`);
}

console.log('SVG redesign complete!');
