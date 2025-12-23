import React from 'react';

// Retro Game Boy / GreenOps Palette
const C = {
  black: '#0f380f',      // Darkest
  darkGreen: '#306230',  // Dark
  lightGreen: '#8bac0f', // Light
  lightestGreen: '#9bbc0f', // Lightest
  brown: '#8b4513',
  darkBrown: '#5e310d',
  sand: '#d2b48c',
  white: '#ffffff',
  gold: '#ffd700',
  darkGold: '#b8860b',
  red: '#d32f2f'
};

// --- CROP STAGES ---

// Level 1-9
const CropStage1 = () => (
  <g>
    <rect x="14" y="26" width="4" height="4" fill={C.brown} opacity="0.6" />
    <rect x="15" y="22" width="2" height="6" fill={C.lightGreen} />
    {/* Tiny leaves */}
    <rect x="13" y="21" width="2" height="2" fill={C.lightGreen} />
    <rect x="17" y="22" width="2" height="2" fill={C.lightGreen} />
  </g>
);

// Level 10-24
const CropStage2 = () => (
  <g>
    <rect x="14" y="26" width="4" height="4" fill={C.brown} opacity="0.7" />
    <rect x="15" y="16" width="2" height="12" fill={C.lightGreen} />
    {/* Medium leaves */}
    <rect x="12" y="18" width="3" height="3" fill={C.darkGreen} />
    <rect x="17" y="17" width="3" height="3" fill={C.darkGreen} />
    {/* Bud */}
    <rect x="13" y="12" width="4" height="4" fill={C.lightestGreen} />
  </g>
);

// Level 25-49
const CropStage3 = () => (
  <g>
    <rect x="12" y="24" width="8" height="4" fill={C.darkBrown} opacity="0.8" />
    <rect x="15" y="14" width="2" height="10" fill={C.lightGreen} />
    {/* Mature leaves */}
    <rect x="10" y="20" width="5" height="2" fill={C.darkGreen} />
    <rect x="17" y="18" width="5" height="2" fill={C.darkGreen} />
    {/* Fruit/Head */}
    <rect x="12" y="6" width="8" height="10" fill={C.gold} />
    <rect x="13" y="7" width="2" height="2" fill={C.white} opacity="0.5" />
    <rect x="14" y="8" width="4" height="6" fill={C.darkGold} opacity="0.3" />
  </g>
);

// Level 50+
const CropStage4 = () => (
  <g>
    {/* Aura */}
    <circle cx="16" cy="16" r="14" fill={C.gold} opacity="0.15" />
    <rect x="10" y="24" width="12" height="4" fill={C.darkBrown} />
    <rect x="14" y="12" width="4" height="12" fill={C.lightGreen} />
    {/* Giant Leaves */}
    <path d="M14,24 L6,20 L14,18 Z" fill={C.darkGreen} />
    <path d="M18,22 L26,18 L18,16 Z" fill={C.darkGreen} />
    {/* Giant Produce */}
    <rect x="10" y="2" width="12" height="14" fill={C.gold} />
    <rect x="12" y="4" width="4" height="4" fill={C.white} opacity="0.7" />
    <rect x="16" y="8" width="4" height="4" fill={C.darkGold} />
    {/* Sparkles */}
    <rect x="8" y="8" width="1" height="1" fill={C.gold} />
    <rect x="23" y="24" width="1" height="1" fill={C.gold} />
  </g>
);

// --- TREE STAGES ---

// Level 1-9
const TreeStage1 = () => (
  <g>
    <rect x="15" y="24" width="2" height="4" fill={C.brown} />
    <rect x="14" y="18" width="4" height="6" fill={C.lightGreen} />
    <rect x="12" y="20" width="2" height="2" fill={C.lightGreen} />
    <rect x="18" y="19" width="2" height="2" fill={C.lightGreen} />
  </g>
);

// Level 10-24
const TreeStage2 = () => (
  <g>
    <rect x="14" y="20" width="4" height="8" fill={C.brown} />
    {/* Bushy Top */}
    <rect x="10" y="10" width="12" height="12" fill={C.darkGreen} />
    <rect x="12" y="8" width="8" height="4" fill={C.darkGreen} />
    <rect x="14" y="14" width="4" height="4" fill={C.lightGreen} />
  </g>
);

// Level 25-49
const TreeStage3 = () => (
  <g>
    <rect x="13" y="20" width="6" height="8" fill={C.darkBrown} />
    {/* Trunk details */}
    <rect x="14" y="22" width="1" height="4" fill={C.brown} />
    {/* Full Canopy */}
    <rect x="6" y="6" width="20" height="16" fill={C.darkGreen} />
    <rect x="8" y="4" width="16" height="4" fill={C.darkGreen} />
    <rect x="4" y="10" width="24" height="8" fill={C.darkGreen} />
    {/* Fruits */}
    <circle cx="10" cy="12" r="2" fill={C.red} />
    <circle cx="22" cy="10" r="2" fill={C.red} />
    <circle cx="16" cy="18" r="2" fill={C.red} />
    <rect x="18" y="6" width="2" height="2" fill={C.lightGreen} />
  </g>
);

// Level 50+
const TreeStage4 = () => (
  <g>
    {/* Ancient Roots */}
    <rect x="10" y="22" width="12" height="8" fill={C.darkBrown} />
    <path d="M10,30 L6,32 L12,28 Z" fill={C.darkBrown} />
    <path d="M22,30 L26,32 L20,28 Z" fill={C.darkBrown} />
    
    {/* Massive Canopy */}
    <rect x="2" y="8" width="28" height="16" fill={C.darkGreen} />
    <rect x="6" y="2" width="20" height="8" fill={C.darkGreen} />
    
    {/* Golden Elements */}
    <rect x="12" y="6" width="8" height="8" fill={C.lightGreen} opacity="0.3" />
    <circle cx="8" cy="14" r="2" fill={C.gold} />
    <circle cx="24" cy="12" r="2" fill={C.gold} />
    <circle cx="16" cy="8" r="3" fill={C.gold} />
    <circle cx="12" cy="20" r="2" fill={C.gold} />
    
    {/* Vines */}
    <path d="M20,20 L20,26" stroke={C.lightGreen} strokeWidth="2" />
    <path d="M12,20 L12,24" stroke={C.lightGreen} strokeWidth="2" />
  </g>
);

interface PlantSpriteProps {
  type: 'crop' | 'tree';
  level: number;
  className?: string;
}

export const PlantSprite: React.FC<PlantSpriteProps> = ({ type, level, className }) => {
  let StageComponent;
  
  if (level >= 50) {
    StageComponent = type === 'crop' ? CropStage4 : TreeStage4;
  } else if (level >= 25) {
    StageComponent = type === 'crop' ? CropStage3 : TreeStage3;
  } else if (level >= 10) {
    StageComponent = type === 'crop' ? CropStage2 : TreeStage2;
  } else {
    StageComponent = type === 'crop' ? CropStage1 : TreeStage1;
  }

  return (
    <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges">
      <StageComponent />
    </svg>
  );
};