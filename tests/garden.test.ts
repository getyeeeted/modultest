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
    expect(total).toBe(40);
  });

  it('should apply global multiplier correctly', () => {
    const crop = new Crop('1', 'wheat', 'Wheat', 1, 10, 10);
    garden.addPlant(crop);

    const total = garden.calculateTotalGPS(2.0); // 2x multiplier
    expect(total).toBe(20);
  });

  it('should handle tree exponential scaling', () => {
    // Tree Level 2: 10 * (1.5^2) = 10 * 2.25 = 22.5
    const tree = new Tree('1', 'test', 'Test Tree', 2, 10, 20); // Value arbitrary here
    garden.addPlant(tree);
    
    expect(garden.calculateTotalGPS(1.0)).toBe(22.5);
  });
  
  it('should remove plant correctly', () => {
    const crop = new Crop('1', 'wheat', 'Wheat', 1, 10, 10);
    garden.addPlant(crop);
    expect(garden.getPlants().length).toBe(1);
    
    garden.removePlant('1');
    expect(garden.getPlants().length).toBe(0);
  });
});