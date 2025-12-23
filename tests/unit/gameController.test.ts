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

    const plantsCount = controller.getPlants().length;
    const expectedPlantsCount = 1;
    const expectedGold = 990;
    console.log(`\n[GameController Core] Test: "purchases a plant when affordable and decreases gold"`);
    console.log(`  Expected: 1 plant, ${expectedGold} gold`);
    console.log(`  Result:   ${plantsCount} plant(s), ${controller.gold} gold`);
    expect(plantsCount).toBe(expectedPlantsCount);
    expect(controller.gold).toBe(expectedGold);
  });

  it('respects garden capacity when purchasing', () => {
    const { controller } = createController(1_000);
    controller.maxGardenSize = 1;

    controller.purchasePlant('p1');
    controller.purchasePlant('p2'); // should be blocked (garden full)

    const plantsCount = controller.getPlants().length;
    const expected = 1;
    console.log(`\n[GameController Core] Test: "respects garden capacity when purchasing"`);
    console.log(`  Expected: ${expected} plant (garden full at size 1)`);
    console.log(`  Result:   ${plantsCount} plant(s)`);
    expect(plantsCount).toBe(expected);
  });

  it('upgrades an existing plant and adjusts gold/value correctly', () => {
    const { controller } = createController(1_000);
    controller.purchasePlant('p1'); // cost 10
    const plant = controller.getPlants()[0];
    const upgradeCost = controller.getPlantUpgradeCost(plant); // base cost * 0.5 * level => 5

    controller.upgradePlant(plant.id);
    const upgraded = controller.getPlants()[0];

    console.log(`\n[GameController Core] Test: "upgrades an existing plant and adjusts gold/value correctly"`);
    console.log(`  Expected: Level 2, Value ${10 + upgradeCost}, Gold ${1_000 - 10 - upgradeCost}`);
    console.log(`  Result:   Level ${upgraded.level}, Value ${upgraded.value}, Gold ${controller.gold}`);
    expect(upgraded.level).toBe(2);
    expect(upgraded.value).toBe(10 + upgradeCost);
    expect(controller.gold).toBe(1_000 - 10 - upgradeCost);
  });

  it('applies global multipliers after purchasing upgrades', () => {
    const { controller } = createController(1_000_000);

    controller.purchaseUpgrade('u1'); // 1.1x
    controller.purchaseUpgrade('u2'); // 1.2x

    const upgradesCount = controller.purchasedUpgrades.size;
    const multiplier = controller.getGlobalMultiplier();
    const expected = 1.32;
    console.log(`\n[GameController Core] Test: "applies global multipliers after purchasing upgrades"`);
    console.log(`  Expected: 2 upgrades, ${expected} multiplier`);
    console.log(`  Result:   ${upgradesCount} upgrade(s), ${multiplier.toFixed(5)} multiplier`);
    expect(upgradesCount).toBe(2);
    expect(multiplier).toBeCloseTo(expected, 5);
  });

  it('persists and reloads game state via save provider', async () => {
    const { controller, provider } = createController(500);
    controller.level = 4;
    controller.maxGardenSize = 8;
    controller.purchasePlant('p1'); // cost 10 -> gold 490
    await controller.saveGame();

    const reloaded = new GameController(provider);
    await reloaded.init();

    console.log(`\n[GameController Core] Test: "persists and reloads game state via save provider"`);
    console.log(`  Expected: Gold 490, Level 4, Size 8, 1 plant`);
    console.log(`  Result:   Gold ${reloaded.gold}, Level ${reloaded.level}, Size ${reloaded.maxGardenSize}, ${reloaded.getPlants().length} plant(s)`);
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

    console.log(`\n[GameController Core] Test: "unlocks achievements based on gold and persists them"`);
    console.log(`  Expected: Achievements a2, a6 unlocked; ${notified.length} notifications`);
    console.log(`  Result:   Unlocked: a2=${controller.unlockedAchievements.has('a2')}, a6=${controller.unlockedAchievements.has('a6')}; Notified: ${notified.join(', ')}`);
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

    const expectedSize = 11;
    console.log(`\n[GameController Core] Test: "increases garden capacity when purchasing garden upgrades sequentially"`);
    console.log(`  Expected: Garden size ${expectedSize}, g2 purchased`);
    console.log(`  Result:   Garden size ${controller.maxGardenSize}, g2=${controller.purchasedGardenUpgrades.has('g2')}`);
    expect(controller.maxGardenSize).toBe(expectedSize);
    expect(controller.purchasedGardenUpgrades.has('g2')).toBe(true);
  });

  it('unlocks Tycoon achievement via high GPS (multiplier stack)', () => {
    const { controller } = createController(1_000_000);
    controller.purchasePlant('p1'); // base 1 gps
    // artificially grant all upgrades to maximize multiplier
    controller.purchasedUpgrades = new Set(UPGRADES_DATA.map(u => u.id));
    controller.tick(1); // compute gps and achievements

    const achieved = controller.unlockedAchievements.has('a5');
    console.log(`\n[GameController Core] Test: "unlocks Tycoon achievement via high GPS (multiplier stack)"`);
    console.log(`  Expected: Achievement a5 (Tycoon) unlocked`);
    console.log(`  Result:   a5 unlocked=${achieved}`);
    expect(achieved).toBe(true);
  });

  it('resetGame uses injected reload function', async () => {
    const provider = new MemorySaveProvider();
    let reloaded = false;
    const controller = new GameController(provider, () => { reloaded = true; });

    await controller.resetGame();
    console.log(`\n[GameController Core] Test: "resetGame uses injected reload function"`);
    console.log(`  Expected: Reload callback called (true)`);
    console.log(`  Result:   Reload callback called (${reloaded})`);
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
    
    console.log(`\n[GameController Core] Test: "falls back to memory provider on primary failure"`);
    console.log(`  Expected: Gold 42 (saved to fallback memory provider)`);
    console.log(`  Result:   Gold ${reload.gold}`);
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
    
    console.log(`\n[GameController Core] Test: "throws when both providers fail during save"`);
    console.log(`  Expected: saveGame() returns false`);
    const result = await controller.saveGame();
    console.log(`  Result:   saveGame() returned ${result}`);
    await expect(controller.saveGame()).resolves.toBe(false);
  });
});

