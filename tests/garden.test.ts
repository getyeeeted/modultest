import { describe, it, expect, beforeEach } from 'vitest';
import { Garden } from '../logic/Garden';
import { Crop } from '../logic/Crop';
import { Tree } from '../logic/Tree';

describe('Garden Logic', () => {
  let garden: Garden;

  beforeEach(() => {
    garden = new Garden();
  });

  it('should calculate total GPS correctly with mixed plants', () => {
    // Crop: Base 10, Level 1, Value 10
    const crop = new Crop('1', 'wheat', 'Wheat', 1, 10, 10);
    // Tree: Base 20, Level 1, Value 20
    const tree = new Tree('2', 'apple', 'Apple', 1, 20, 20);

    garden.addPlant(crop);
    garden.addPlant(tree);

    const total = garden.calculateTotalGPS(1.0);
    const expected = 40;
    console.log(`\n[Garden Logic] Test: "should calculate total GPS correctly with mixed plants"`);
    console.log(`  Expected: ${expected} GPS`);
    console.log(`  Result:   ${total} GPS`);
    expect(total).toBe(expected);
  });

  it('should apply global multiplier correctly', () => {
    const crop = new Crop('1', 'wheat', 'Wheat', 1, 10, 10);
    garden.addPlant(crop);

    const total = garden.calculateTotalGPS(2.0); // 2x multiplier
    const expected = 20;
    console.log(`\n[Garden Logic] Test: "should apply global multiplier correctly"`);
    console.log(`  Expected: ${expected} GPS (with 2.0x multiplier)`);
    console.log(`  Result:   ${total} GPS`);
    expect(total).toBe(expected);
  });

  it('should handle tree exponential scaling', () => {
    // Tree Level 2: 10 * (1.5^2) = 10 * 2.25 = 22.5
    const tree = new Tree('1', 'test', 'Test Tree', 2, 10, 20); // Value arbitrary here
    garden.addPlant(tree);
    
    const total = garden.calculateTotalGPS(1.0);
    const expected = 22.5;
    console.log(`\n[Garden Logic] Test: "should handle tree exponential scaling"`);
    console.log(`  Expected: ${expected} GPS (Tree Level 2: 10 * 1.5^2)`);
    console.log(`  Result:   ${total} GPS`);
    expect(total).toBe(expected);
  });
  
  it('should remove plant correctly', () => {
    const crop = new Crop('1', 'wheat', 'Wheat', 1, 10, 10);
    garden.addPlant(crop);
    console.log(`\n[Garden Logic] Test: "should remove plant correctly"`);
    console.log(`  Expected after add: 1 plant`);
    console.log(`  Result after add:   ${garden.getPlants().length} plant(s)`);
    expect(garden.getPlants().length).toBe(1);
    
    garden.removePlant('1');
    console.log(`  Expected after remove: 0 plants`);
    console.log(`  Result after remove:   ${garden.getPlants().length} plant(s)`);
    expect(garden.getPlants().length).toBe(0);
  });
});