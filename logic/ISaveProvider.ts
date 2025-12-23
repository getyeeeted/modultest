import { SaveData } from '../types';

/** Abstraktion für Savegame-Persistenz. */
export interface ISaveProvider {
  save(data: SaveData): Promise<void>;
  load(): Promise<SaveData | null>;
  clear(): Promise<void>;
}