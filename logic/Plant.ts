/** Abstrakte Basis für alle Pflanzen. */
export abstract class Plant {
  private _id: string;
  private _plantId: string; // Reference to static data ID
  private _name: string;
  private _level: number;
  private _baseYield: number;
  private _value: number; // Total gold invested (Purchase + Upgrades)

  constructor(id: string, plantId: string, name: string, level: number, baseYield: number, value: number) {
    this._id = id;
    this._plantId = plantId;
    this._name = name;
    this._level = level;
    this._baseYield = baseYield;
    this._value = value;
  }

  // Abstract method as required
  abstract calculateYield(globalMultiplier: number): number;

  public upgrade(cost: number): void {
    this._level += 1;
    this._value += cost;
  }

  // Getters
  public get id(): string { return this._id; }
  public get plantId(): string { return this._plantId; }
  public get name(): string { return this._name; }
  public get level(): number { return this._level; }
  public get baseYield(): number { return this._baseYield; }
  public get value(): number { return this._value; }
}