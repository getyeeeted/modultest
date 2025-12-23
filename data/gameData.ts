import { PlantData, UpgradeData, GardenUpgradeData, Achievement } from '../types';

export const PLANTS_DATA: PlantData[] = [
  // Farm Biome (Levels 1-5)
  { id: 'p1', name: 'Pixel Wheat', type: 'crop', baseYield: 1, description: 'Basic sustenance.', cost: 10, unlockLevel: 1, lore: 'The first pixel of life.' },
  { id: 'p2', name: 'Bit Carrot', type: 'crop', baseYield: 3, description: 'Orange and crunchy.', cost: 50, unlockLevel: 2, lore: 'Rabbits dream in 8-bit.' },
  { id: 'p3', name: 'Data Corn', type: 'crop', baseYield: 8, description: 'It listens.', cost: 150, unlockLevel: 3, lore: 'Kernels of pure info.' },
  { id: 'p4', name: 'Logic Potato', type: 'crop', baseYield: 15, description: 'Powered by chips.', cost: 400, unlockLevel: 4, lore: 'Processes starch logic.' },
  { id: 'p5', name: 'Apple Tree', type: 'tree', baseYield: 5, description: 'Gravity defying.', cost: 1000, unlockLevel: 5, lore: 'Sir Isaac was here.' },

  // Desert Biome (Levels 6-10)
  { id: 'p6', name: 'Sand Cactus', type: 'crop', baseYield: 40, description: 'Spiky business.', cost: 2500, unlockLevel: 6, lore: 'Hugs are not advised.' },
  { id: 'p7', name: 'Aloe Vera', type: 'crop', baseYield: 75, description: 'Healing pixels.', cost: 6000, unlockLevel: 7, lore: 'Soothes digital burns.' },
  { id: 'p8', name: 'Dry Bush', type: 'crop', baseYield: 120, description: 'Tumbleweed starter.', cost: 15000, unlockLevel: 8, lore: 'Rolls when nobody looks.' },
  { id: 'p9', name: 'Date Palm', type: 'tree', baseYield: 30, description: 'Sweet oasis fruit.', cost: 35000, unlockLevel: 9, lore: 'A mirage made real.' },
  { id: 'p10', name: 'Joshua Tree', type: 'tree', baseYield: 50, description: 'Desert guardian.', cost: 80000, unlockLevel: 10, lore: 'Reaching for the sky.' },

  // Jungle Biome (Levels 11-15)
  { id: 'p11', name: 'Wild Fern', type: 'crop', baseYield: 300, description: 'Ancient flora.', cost: 200000, unlockLevel: 11, lore: 'Dinosaur snack food.' },
  { id: 'p12', name: 'Creep Vine', type: 'crop', baseYield: 500, description: 'It grows fast.', cost: 500000, unlockLevel: 12, lore: 'Climbs without permission.' },
  { id: 'p13', name: 'Cocoa Plant', type: 'crop', baseYield: 800, description: 'Sweet beans.', cost: 1200000, unlockLevel: 13, lore: 'Source of dark gold.' },
  { id: 'p14', name: 'Banana Tree', type: 'tree', baseYield: 200, description: 'Potassium rich.', cost: 3000000, unlockLevel: 14, lore: 'Slippery when peeled.' },
  { id: 'p15', name: 'Rubber Tree', type: 'tree', baseYield: 450, description: 'Elastic profits.', cost: 8000000, unlockLevel: 15, lore: 'Bounce back economy.' },
];

export const UPGRADES_DATA: UpgradeData[] = [
  { id: 'u1', name: 'Rusty Hoe', description: 'Better than hands.', cost: 100, multiplier: 1.1, lore: 'Found in the old barn.' },
  { id: 'u2', name: 'Water Can', description: 'Hydration is key.', cost: 500, multiplier: 1.2, lore: 'Leaks a bit, but works.' },
  { id: 'u3', name: 'Fertilizer', description: 'Smells bad, works good.', cost: 2000, multiplier: 1.25, lore: 'Organic pixel waste.' },
  { id: 'u4', name: 'Scarecrow', description: 'Frightens bugs.', cost: 5000, multiplier: 1.3, lore: 'It has a binary brain.' },
  { id: 'u5', name: 'Sprinkler', description: 'Auto-watering.', cost: 12000, multiplier: 1.4, lore: 'Advanced irrigation tech.' },
  { id: 'u6', name: 'Greenhouse', description: 'Controlled climate.', cost: 30000, multiplier: 1.5, lore: 'Glass walls keep heat.' },
  { id: 'u7', name: 'Grafting Tool', description: 'Mix plants.', cost: 75000, multiplier: 1.6, lore: 'Create hybrid pixels.' },
  { id: 'u8', name: 'Drone', description: 'Aerial survey.', cost: 200000, multiplier: 1.7, lore: 'Watching from above.' },
  { id: 'u9', name: 'Hydroponics', description: 'No soil needed.', cost: 500000, multiplier: 1.8, lore: 'Water is the new earth.' },
  { id: 'u10', name: 'Solar Lamp', description: '24/7 Sunlight.', cost: 1500000, multiplier: 2.0, lore: 'Harness the sun.' },
  { id: 'u11', name: 'AI Manager', description: 'Automated farming.', cost: 5000000, multiplier: 2.2, lore: 'Neural networks for farming.' },
  { id: 'u12', name: 'Genetics Lab', description: 'Modify DNA.', cost: 15000000, multiplier: 2.5, lore: 'Playing god with pixels.' },
  { id: 'u13', name: 'Weather Ctrl', description: 'Rain on demand.', cost: 50000000, multiplier: 3.0, lore: 'Cloud seeding machine.' },
  { id: 'u14', name: 'Time Warp', description: 'Faster growth.', cost: 150000000, multiplier: 4.0, lore: 'Bend time for crops.' },
  { id: 'u15', name: 'Gaia Link', description: 'One with nature.', cost: 500000000, multiplier: 5.0, lore: 'The planet helps you farm.' },
];

export const GARDEN_UPGRADES_DATA: GardenUpgradeData[] = [
  { id: 'g1', name: 'Plot Expansion I', cost: 1000, capacityIncrease: 2, description: 'Clear some weeds.' },
  { id: 'g2', name: 'Plot Expansion II', cost: 5000, capacityIncrease: 3, description: 'Buy neighbor\'s land.' },
  { id: 'g3', name: 'Plot Expansion III', cost: 20000, capacityIncrease: 5, description: 'Deforest the area.' },
  { id: 'g4', name: 'Plot Expansion IV', cost: 100000, capacityIncrease: 5, description: 'Terraforming.' },
  { id: 'g5', name: 'Plot Expansion V', cost: 500000, capacityIncrease: 10, description: 'Pocket Dimension.' },
];

export const ACHIEVEMENTS_DATA: Achievement[] = [
  { id: 'a1', name: 'First Sprout', description: 'Own 1 Plant.', icon: 'sprout', condition: (g, l, p, gps) => p >= 1 },
  { id: 'a2', name: 'Pocket Money', description: 'Reach 1,000 Gold.', icon: 'coin', condition: (g, l, p, gps) => g >= 1000 },
  { id: 'a3', name: 'Full House', description: 'Have 6 Plants.', icon: 'house', condition: (g, l, p, gps) => p >= 6 },
  { id: 'a4', name: 'Desert Storm', description: 'Reach Level 6.', icon: 'cactus', condition: (g, l, p, gps) => l >= 6 },
  { id: 'a5', name: 'Tycoon', description: 'Reach 10,000 GPS.', icon: 'bolt', condition: (g, l, p, gps) => gps >= 10000 },
  { id: 'a6', name: 'Millionaire', description: 'Reach 1,000,000 Gold.', icon: 'gem', condition: (g, l, p, gps) => g >= 1000000 },
];