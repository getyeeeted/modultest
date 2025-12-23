import { Garden } from './Garden';
import { Plant } from './Plant';
import { Crop } from './Crop';
import { Tree } from './Tree';
import { ISaveProvider } from './ISaveProvider';
import { SaveData, PlantData, BiomeType, Achievement } from '../types';
import { PLANTS_DATA, UPGRADES_DATA, GARDEN_UPGRADES_DATA, ACHIEVEMENTS_DATA } from '../data/gameData';

/**
 * Zentrale Spiellogik: verwaltet Ressourcen, Pflanzen, Upgrades, Achievements und Persistenz.
 */
export class GameController {
  private garden: Garden;
  private saveProvider: ISaveProvider;
  private reloadFn: () => void;
  
  public gold: number = 0;
  public level: number = 1;
  public maxGardenSize: number = 6; // Default starting size
  public purchasedUpgrades: Set<string> = new Set();
  public purchasedGardenUpgrades: Set<string> = new Set();
  public unlockedAchievements: Set<string> = new Set();
  
  // Callback to notify UI of updates
  private notifyListeners: () => void = () => {};
  private notifyAchievement: (ach: Achievement) => void = () => {};

  /**
   * @param saveProvider Speicher-Backend (via IoC injizierbar)
   * @param reloadFn     Hook für Reset, im UI injizierbar/testbar
   */
  constructor(saveProvider: ISaveProvider, reloadFn: () => void = () => { if (typeof window !== 'undefined') window.location.reload(); }) {
    this.garden = new Garden();
    this.saveProvider = saveProvider;
    this.reloadFn = reloadFn;
  }

  /** Registriert UI-Listener für State-Updates. */
  public setListener(listener: () => void) {
    this.notifyListeners = listener;
  }

  /** Registriert UI-Listener für Achievement-Unlocks. */
  public setAchievementListener(listener: (ach: Achievement) => void) {
    this.notifyAchievement = listener;
  }

  /** Lädt Spielstand oder setzt Defaultwerte. */
  public async init() {
    const savedData = await this.saveProvider.load();
    if (savedData) {
      this.gold = savedData.gold;
      this.level = savedData.level;
      this.maxGardenSize = savedData.maxGardenSize || 6; // Backwards compat
      this.purchasedUpgrades = new Set(savedData.upgrades);
      this.purchasedGardenUpgrades = new Set(savedData.gardenUpgrades || []);
      this.unlockedAchievements = new Set(savedData.achievements || []);
      
      this.garden.clear();
      savedData.plants.forEach(pData => {
        const template = PLANTS_DATA.find(t => t.id === pData.plantId);
        if (template) {
          // Backwards compat for value: estimate if missing (BaseCost * Level)
          const estimatedValue = pData.value || (template.cost * pData.level);
          this.createPlantInstance(pData.id, template, pData.level, estimatedValue);
        }
      });
    } else {
      // Start fresh
      this.gold = 50; // Starting gold
      this.level = 1;
      this.maxGardenSize = 6;
      this.unlockedAchievements = new Set();
    }
    this.notifyListeners();
  }

  private createPlantInstance(instanceId: string, template: PlantData, level: number, value: number) {
    let newPlant: Plant;
    if (template.type === 'crop') {
      newPlant = new Crop(instanceId, template.id, template.name, level, template.baseYield, value);
    } else {
      newPlant = new Tree(instanceId, template.id, template.name, level, template.baseYield, value);
    }
    this.garden.addPlant(newPlant);
  }

  /** Aggregiert globale Upgrades zu einem Multiplikator. */
  public getGlobalMultiplier(): number {
    let multiplier = 1.0;
    this.purchasedUpgrades.forEach(uId => {
      const u = UPGRADES_DATA.find(d => d.id === uId);
      if (u) multiplier *= u.multiplier;
    });
    return multiplier;
  }

  /** Zeitfortschritt: akkumuliert GPS, prüft Achievements, benachrichtigt UI. */
  public tick(dtSeconds: number) {
    const gps = this.garden.calculateTotalGPS(this.getGlobalMultiplier());
    this.gold += gps * dtSeconds;
    this.checkAchievements();
    this.notifyListeners();
  }

  /** Prüft und schaltet Achievements frei. */
  public checkAchievements() {
    const plantsCount = this.garden.getPlants().length;
    const gps = this.garden.calculateTotalGPS(this.getGlobalMultiplier());

    ACHIEVEMENTS_DATA.forEach(ach => {
      if (!this.unlockedAchievements.has(ach.id)) {
        if (ach.condition(this.gold, this.level, plantsCount, gps)) {
          this.unlockedAchievements.add(ach.id);
          this.notifyAchievement(ach);
          this.saveGame();
        }
      }
    });
  }

  /** Validiert Kaufbedingungen für Pflanzen. */
  public canPurchasePlant(plantId: string): { allowed: boolean, reason?: string } {
    if (this.garden.getPlants().length >= this.maxGardenSize) {
      return { allowed: false, reason: 'Garden Full' };
    }
    const count = this.garden.getPlants().filter(p => p.plantId === plantId).length;
    if (count >= 5) {
      return { allowed: false, reason: 'Max 5 per type' };
    }
    return { allowed: true };
  }

  /** Kauft Pflanze bei ausreichendem Gold und Kapazität. */
  public purchasePlant(plantId: string) {
    const check = this.canPurchasePlant(plantId);
    if (!check.allowed) return;

    const template = PLANTS_DATA.find(p => p.id === plantId);
    if (!template) return;
    
    // Plant cost scales with number of existing plants of same type
    const existingCount = this.garden.getPlants().filter(p => p.plantId === plantId).length;
    const cost = Math.floor(template.cost * Math.pow(1.2, existingCount));

    if (this.gold >= cost) {
      this.gold -= cost;
      const instanceId = Date.now().toString() + Math.random().toString().slice(0,5);
      this.createPlantInstance(instanceId, template, 1, cost);
      
      this.checkPlayerLevel();
      
      this.saveGame();
      this.notifyListeners();
    }
  }

  /** Upgradet eine Pflanze, wenn Gold ausreicht. */
  public upgradePlant(instanceId: string) {
    const plant = this.garden.getPlantById(instanceId);
    if (!plant) return;

    const template = PLANTS_DATA.find(p => p.id === plant.plantId);
    if (!template) return;

    const cost = this.getPlantUpgradeCost(plant);
    if (this.gold >= cost) {
      this.gold -= cost;
      plant.upgrade(cost);
      this.saveGame();
      this.notifyListeners();
    }
  }

  /** Berechnet Upgrade-Kosten aus Template und Level. */
  public getPlantUpgradeCost(plant: Plant): number {
    const template = PLANTS_DATA.find(p => p.id === plant.plantId);
    if (!template) return 999999999;
    return Math.floor(template.cost * 0.5 * plant.level);
  }

  /** Berechnet Verkaufserlös einer Pflanze. */
  public getSellValue(plant: Plant): number {
    return Math.floor(plant.value * 0.45);
  }

  /** Verkauft Pflanze und entfernt sie aus dem Garden. */
  public sellPlant(instanceId: string) {
    const plant = this.garden.getPlantById(instanceId);
    if (!plant) return;
    
    const sellValue = this.getSellValue(plant);
    this.gold += sellValue;
    this.garden.removePlant(instanceId);
    
    this.saveGame();
    this.notifyListeners();
  }

  /** Kauft globales Upgrade (lineare Kette). */
  public purchaseUpgrade(upgradeId: string) {
    if (this.purchasedUpgrades.has(upgradeId)) return;
    
    const index = UPGRADES_DATA.findIndex(u => u.id === upgradeId);
    if (index === -1) return;
    const template = UPGRADES_DATA[index];

    // Lock check: Must have purchased previous upgrade
    if (index > 0) {
      const prevId = UPGRADES_DATA[index - 1].id;
      if (!this.purchasedUpgrades.has(prevId)) return; // Locked
    }

    if (this.gold >= template.cost) {
      this.gold -= template.cost;
      this.purchasedUpgrades.add(upgradeId);
      this.saveGame();
      this.notifyListeners();
    }
  }

  /** Kauft Garden-Upgrade (lineare Kette) und erhöht Kapazität. */
  public purchaseGardenUpgrade(upgradeId: string) {
    if (this.purchasedGardenUpgrades.has(upgradeId)) return;
    
    const index = GARDEN_UPGRADES_DATA.findIndex(u => u.id === upgradeId);
    if (index === -1) return;
    const template = GARDEN_UPGRADES_DATA[index];

    // Lock check: Must have purchased previous garden upgrade
    if (index > 0) {
      const prevId = GARDEN_UPGRADES_DATA[index - 1].id;
      if (!this.purchasedGardenUpgrades.has(prevId)) return; // Locked
    }

    if (this.gold >= template.cost) {
      this.gold -= template.cost;
      this.purchasedGardenUpgrades.add(upgradeId);
      this.maxGardenSize += template.capacityIncrease;
      this.saveGame();
      this.notifyListeners();
    }
  }

  /** Level-Berechnung basierend auf Pflanzenanzahl. */
  private checkPlayerLevel() {
    const totalPlants = this.garden.getPlants().length;
    const newLevel = 1 + Math.floor(totalPlants / 3);
    if (newLevel > this.level) {
      this.level = newLevel;
    }
  }

  /** Liefert Biome basierend auf Level-Grenzen. */
  public getBiome(): BiomeType {
    if (this.level >= 11) return BiomeType.JUNGLE;
    if (this.level >= 6) return BiomeType.DESERT;
    return BiomeType.FARM;
  }

  /** Liefert Pflanzenkopien aus dem Garden. */
  public getPlants() { return this.garden.getPlants(); }
  /** Berechnet aktuellen GPS-Wert. */
  public getGPS() { return this.garden.calculateTotalGPS(this.getGlobalMultiplier()); }

  /**
   * Speichert Spielstand. true bei Erfolg, false falls auch Fallback scheitert.
   */
  public async saveGame(): Promise<boolean> {
    const saveData: SaveData = {
      gold: this.gold,
      level: this.level,
      maxGardenSize: this.maxGardenSize,
      plants: this.garden.getPlants().map(p => ({
        id: p.id,
        level: p.level,
        plantId: p.plantId,
        value: p.value
      })),
        upgrades: Array.from(this.purchasedUpgrades),
        gardenUpgrades: Array.from(this.purchasedGardenUpgrades),
        achievements: Array.from(this.unlockedAchievements)
      };
    try {
      await this.saveProvider.save(saveData);
      return true;
    } catch (e) {
      console.error('Save failed (all providers)', e);
      return false;
    }
  }
  
  /** Löscht Savegame und triggert Reload (injizierbar). */
  public async resetGame() {
      await this.saveProvider.clear();
      this.reloadFn();
  }
}