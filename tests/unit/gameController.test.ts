import { describe, it, expect } from 'vitest';
import { GameController } from '../../logic/GameController';
import { ISaveProvider } from '../../logic/ISaveProvider';
import { SaveData } from '../../types';
import { ResilientSaveProvider } from '../../logic/ResilientSaveProvider';
import { MemorySaveProvider } from '../../logic/MemorySaveProvider';
import { UPGRADES_DATA } from '../../data/gameData';

const createController = (gold = 1_000) => {
  const provider = new MemorySaveProvider();
  const controller = new GameController(provider);
  controller.gold = gold;
  controller.level = 1;
  controller.maxGardenSize = 6;
  return { controller, provider };
};

describe('GameController core logic', () => {
  it('purchases a plant when affordable and decreases gold', () => {
    const { controller } = createController(1_000);

    controller.purchasePlant('p1'); // cost 10

    expect(controller.getPlants().length).toBe(1);
    expect(controller.gold).toBe(990);
  });

  it('respects garden capacity when purchasing', () => {
    const { controller } = createController(1_000);
    controller.maxGardenSize = 1;

    controller.purchasePlant('p1');
    controller.purchasePlant('p2'); // should be blocked (garden full)

    expect(controller.getPlants().length).toBe(1);
  });

  it('upgrades an existing plant and adjusts gold/value correctly', () => {
    const { controller } = createController(1_000);
    controller.purchasePlant('p1'); // cost 10
    const plant = controller.getPlants()[0];
    const upgradeCost = controller.getPlantUpgradeCost(plant); // base cost * 0.5 * level => 5

    controller.upgradePlant(plant.id);
    const upgraded = controller.getPlants()[0];

    expect(upgraded.level).toBe(2);
    expect(upgraded.value).toBe(10 + upgradeCost);
    expect(controller.gold).toBe(1_000 - 10 - upgradeCost);
  });

  it('applies global multipliers after purchasing upgrades', () => {
    const { controller } = createController(1_000_000);

    controller.purchaseUpgrade('u1'); // 1.1x
    controller.purchaseUpgrade('u2'); // 1.2x

    expect(controller.purchasedUpgrades.size).toBe(2);
    expect(controller.getGlobalMultiplier()).toBeCloseTo(1.32, 5);
  });

  it('persists and reloads game state via save provider', async () => {
    const { controller, provider } = createController(500);
    controller.level = 4;
    controller.maxGardenSize = 8;
    controller.purchasePlant('p1'); // cost 10 -> gold 490
    await controller.saveGame();

    const reloaded = new GameController(provider);
    await reloaded.init();

    expect(reloaded.gold).toBe(490);
    expect(reloaded.level).toBe(4);
    expect(reloaded.maxGardenSize).toBe(8);
    expect(reloaded.getPlants().length).toBe(1);
  });

  it('unlocks achievements based on gold and persists them', async () => {
    const { controller, provider } = createController(1_500_000); // triggers a2 (1000), a6 (1_000_000)
    const notified: string[] = [];
    controller.setAchievementListener((ach) => notified.push(ach.id));

    controller.checkAchievements();
    await new Promise((r) => setImmediate(r));

    expect(controller.unlockedAchievements.has('a2')).toBe(true);
    expect(controller.unlockedAchievements.has('a6')).toBe(true);
    expect(notified).toEqual(expect.arrayContaining(['a2', 'a6']));

    const reloaded = new GameController(provider);
    await reloaded.init();
    expect(reloaded.unlockedAchievements.has('a6')).toBe(true);
  });

  it('increases garden capacity when purchasing garden upgrades sequentially', () => {
    const { controller } = createController(1_000_000);

    controller.purchaseGardenUpgrade('g1'); // +2 -> 8
    controller.purchaseGardenUpgrade('g2'); // +3 -> 11

    expect(controller.maxGardenSize).toBe(11);
    expect(controller.purchasedGardenUpgrades.has('g2')).toBe(true);
  });

  it('unlocks Tycoon achievement via high GPS (multiplier stack)', () => {
    const { controller } = createController(1_000_000);
    controller.purchasePlant('p1'); // base 1 gps
    // artificially grant all upgrades to maximize multiplier
    controller.purchasedUpgrades = new Set(UPGRADES_DATA.map(u => u.id));
    controller.tick(1); // compute gps and achievements

    expect(controller.unlockedAchievements.has('a5')).toBe(true);
  });

  it('resetGame uses injected reload function', async () => {
    const provider = new MemorySaveProvider();
    let reloaded = false;
    const controller = new GameController(provider, () => { reloaded = true; });

    await controller.resetGame();
    expect(reloaded).toBe(true);
  });

  it('falls back to memory provider on primary failure', async () => {
    class FailingProvider implements ISaveProvider {
      async save(): Promise<void> { throw new Error('fail'); }
      async load(): Promise<SaveData | null> { throw new Error('fail'); }
      async clear(): Promise<void> { throw new Error('fail'); }
    }

    const resilient = new ResilientSaveProvider(new FailingProvider(), new MemorySaveProvider());
    const controller = new GameController(resilient);
    controller.gold = 42;
    await controller.saveGame();

    const reload = new GameController(resilient);
    await reload.init();
    expect(reload.gold).toBe(42);
  });

  it('throws when both providers fail during save', async () => {
    class FailingProvider implements ISaveProvider {
      async save(): Promise<void> { throw new Error('fail'); }
      async load(): Promise<SaveData | null> { throw new Error('fail'); }
      async clear(): Promise<void> { throw new Error('fail'); }
    }
    const failing = new ResilientSaveProvider(new FailingProvider(), new FailingProvider());
    const controller = new GameController(failing);
    await expect(controller.saveGame()).resolves.toBe(false);
  });
});

