/**
 * Minimal IoC-Container: registriert Factories und liefert Singleton-Instanzen.
 */
export class IoCContainer {
  private singletons = new Map<string, unknown>();
  private factories = new Map<string, () => unknown>();

  /**
   * Registriert eine Factory als Singleton-Produzent.
   */
  registerSingleton<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }

  /**
   * Liefert die Singleton-Instanz für das Token (lazy erzeugt).
   */
  resolve<T>(token: string): T {
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }
    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`No factory registered for token ${token}`);
    }
    const instance = factory();
    this.singletons.set(token, instance);
    return instance as T;
  }
}

