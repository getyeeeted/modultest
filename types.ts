export enum BiomeType {
  FARM = 'FARM',
  DESERT = 'DESERT',
  JUNGLE = 'JUNGLE'
}

export interface PlantData {
  id: string;
  name: string;
  type: 'crop' | 'tree';
  baseYield: number;
  description: string;
  cost: number;
  unlockLevel: number;
  lore: string;
}

export interface UpgradeData {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  lore: string;
}

export interface GardenUpgradeData {
  id: string;
  name: string;
  cost: number;
  capacityIncrease: number;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (gold: number, level: number, plantsCount: number, gps: number) => boolean;
  icon: string; // Identifier for the icon component (e.g., 'sprout', 'coin')
}

export interface SaveData {
  gold: number;
  level: number;
  maxGardenSize: number;
  plants: Array<{ id: string; level: number; plantId: string; value: number }>;
  upgrades: string[]; // IDs of purchased upgrades
  gardenUpgrades: string[]; // IDs of purchased garden upgrades
  achievements: string[]; // IDs of unlocked achievements
}