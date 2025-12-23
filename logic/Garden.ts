import { Plant } from './Plant';

/** Aggregat für Pflanzen; kapselt Mutationen und GPS-Berechnung. */
export class Garden {
  private _plants: Plant[] = [];

  constructor() {}

  /** Fügt eine Pflanze hinzu. */
  public addPlant(plant: Plant): void {
    this._plants.push(plant);
  }

  /** Entfernt Pflanze per ID. */
  public removePlant(plantId: string): void {
    this._plants = this._plants.filter(p => p.id !== plantId);
  }

  /** Liefert Kopie der Pflanzensammlung. */
  public getPlants(): Plant[] {
    return [...this._plants];
  }

  /** Summiert GPS aller Pflanzen unter globalem Multiplikator. */
  public calculateTotalGPS(globalMultiplier: number): number {
    return this._plants.reduce((total, plant) => {
      return total + plant.calculateYield(globalMultiplier);
    }, 0);
  }

  /** Sucht Pflanze per ID. */
  public getPlantById(id: string): Plant | undefined {
    return this._plants.find(p => p.id === id);
  }

  /** Entfernt alle Pflanzen. */
  public clear(): void {
    this._plants = [];
  }
}