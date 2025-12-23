import { IoCContainer } from './IoCContainer';
import { createSaveProvider } from './SaveProviderFactory';
import { GameController } from './GameController';

/**
 * Registriert Standard-Services im IoC-Container.
 */
export function registerDefaultServices(container: IoCContainer): void {
  container.registerSingleton('saveProvider', () => createSaveProvider());
  container.registerSingleton('gameController', () => new GameController(container.resolve('saveProvider')));
}

