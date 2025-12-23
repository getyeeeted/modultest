import { Plant } from './Plant';

/** Pflanze mit linearer Ertrags-Skalierung. */
export class Crop extends Plant {
  calculateYield(globalMultiplier: number): number {
    // Linear Scaling: Base * Level
    return this.baseYield * this.level * globalMultiplier;
  }
}