import { Plant } from './Plant';

/** Pflanze mit exponentieller Ertrags-Skalierung. */
export class Tree extends Plant {
  calculateYield(globalMultiplier: number): number {
    // Exponential Scaling: Base * (1.5 ^ Level)
    return this.baseYield * Math.pow(1.5, this.level) * globalMultiplier;
  }
}