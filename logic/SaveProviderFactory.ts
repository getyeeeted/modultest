import { ISaveProvider } from './ISaveProvider';
import { LocalStorageProvider } from './LocalStorageProvider';
import { MemorySaveProvider } from './MemorySaveProvider';
import { ResilientSaveProvider } from './ResilientSaveProvider';

/**
 * Factory: Resilient(LocalStorage -> Memory).
 */
export function createSaveProvider(): ISaveProvider {
  const primary = new LocalStorageProvider();
  const fallback = new MemorySaveProvider();
  return new ResilientSaveProvider(primary, fallback);
}

