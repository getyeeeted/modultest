import { ISaveProvider } from './ISaveProvider';
import { SaveData } from '../types';

/** Persistenz im Browser-localStorage. */
export class LocalStorageProvider implements ISaveProvider {
  private static KEY = 'greenops_garden_save_v1';

  async save(data: SaveData): Promise<void> {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(LocalStorageProvider.KEY, json);
    } catch (e) {
      console.error("Failed to save game", e);
    }
  }

  async load(): Promise<SaveData | null> {
    try {
      const json = localStorage.getItem(LocalStorageProvider.KEY);
      if (!json) return null;
      return JSON.parse(json) as SaveData;
    } catch (e) {
      console.error("Failed to load game", e);
      return null;
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(LocalStorageProvider.KEY);
  }
}