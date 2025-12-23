import { ISaveProvider } from './ISaveProvider';
import { SaveData } from '../types';

export interface SaveResult {
  success: boolean;
  fallbackUsed: boolean;
  error?: unknown;
}

/**
 * Wraps a primary provider with a fallback (e.g., Memory) to increase robustness.
 * Throws only wenn beide Provider scheitern.
 */
export class ResilientSaveProvider implements ISaveProvider {
  constructor(
    private primary: ISaveProvider,
    private fallback: ISaveProvider
  ) {}

  async save(data: SaveData): Promise<void> {
    try {
      await this.primary.save(data);
      return;
    } catch (e) {
      console.error('Primary save failed, using fallback', e);
      try {
        await this.fallback.save(data);
        return;
      } catch (fallbackError) {
        throw new Error(`Both save providers failed: ${String(fallbackError)}`);
      }
    }
  }

  async load(): Promise<SaveData | null> {
    try {
      const loaded = await this.primary.load();
      if (loaded) return loaded;
    } catch (e) {
      console.error('Primary load failed, using fallback', e);
    }
    try {
      return await this.fallback.load();
    } catch (fallbackError) {
      throw new Error(`Both load providers failed: ${String(fallbackError)}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.primary.clear();
    } catch (e) {
      console.error('Primary clear failed, clearing fallback', e);
    }
    try {
      await this.fallback.clear();
    } catch (fallbackError) {
      throw new Error(`Both clear providers failed: ${String(fallbackError)}`);
    }
  }
}

