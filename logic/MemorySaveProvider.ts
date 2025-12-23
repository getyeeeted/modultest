import { ISaveProvider } from './ISaveProvider';
import { SaveData } from '../types';

/** In-Memory Save Provider (Fallback/Tests). */
export class MemorySaveProvider implements ISaveProvider {
  private data: SaveData | null = null;

  async save(data: SaveData): Promise<void> {
    this.data = JSON.parse(JSON.stringify(data));
  }

  async load(): Promise<SaveData | null> {
    return this.data ? JSON.parse(JSON.stringify(this.data)) : null;
  }

  async clear(): Promise<void> {
    this.data = null;
  }
}

