# GreenOps Garden – Objektorientierte Projektdokumentation

## Fehlende oder fehlerhafte Punkte (gemäss Vorgaben)
- **Dokumentations-Infrastruktur**: TSDoc an zentralen Klassen/öffentlichen Methoden ergänzt (GameController, Garden, Plant-Hierarchie, Save-Provider, IoC); weitere Ausbreitung auf UI-Komponenten möglich.
- **Dependency Injection**: Vollwertiger IoC-Container (`IoCContainer`, `registerDefaultServices`) integriert; austauschbare Provider/Controller werden über Token aufgelöst.
- **Validierung und Fehlerfälle**: Persistenz abgesichert durch `ResilientSaveProvider` (wirft nur bei doppeltem Fehler), UI erhält Fehler-Toast und automatischen Retry; Eingaben zusätzlich validiert (kein Kauf ohne Template/Lock).
- **Testabdeckung**: Erweiterte Suite inkl. Fallback-Fehlerfall (beide Provider fallen aus). UI-Fehlerpfade/E2E weiterhin offen.

---

## 1. Projektüberblick
- **Domäne**: Clicker-/Incremental-Game mit Garten-Management. Kernfunktionen: Pflanzen kaufen, upgraden, verkaufen; globale und Garten-Upgrades; Achievements; Biome-Fortschritt.
- **Frontend**: React + Framer Motion; Pixel-Art UI-Komponenten.
- **Kernlogik (OOP)**: TypeScript-Klassen in `logic/` kapseln Spielzustand und Geschäftsregeln. Persistenz über `ISaveProvider`-Schnittstelle.
- **Daten**: Statische Templates (`PLANTS_DATA`, `UPGRADES_DATA`, `GARDEN_UPGRADES_DATA`, `ACHIEVEMENTS_DATA`) als konstante Domänenparameter.

## 2. Objektorientierte Grundkonzepte im Projekt
- **Kapselung**: Zustand der Pflanzen durch private Felder und Getter geschützt.

```1:32:logic/Plant.ts
export abstract class Plant {
  private _id: string;
  private _plantId: string;
  // ...
  public get id(): string { return this._id; }
}
```

- **Vererbung & Spezialisierung**: `Crop` und `Tree` spezialisieren die abstrakte Basisklasse `Plant` und überschreiben die Ertragslogik.

```1:7:logic/Crop.ts
export class Crop extends Plant {
  calculateYield(globalMultiplier: number): number {
    return this.baseYield * this.level * globalMultiplier;
  }
}
```

```1:7:logic/Tree.ts
export class Tree extends Plant {
  calculateYield(globalMultiplier: number): number {
    return this.baseYield * Math.pow(1.5, this.level) * globalMultiplier;
  }
}
```

- **Polymorphie & dynamische Bindung**: `Garden.calculateTotalGPS` ruft `calculateYield` polymorph auf, ohne die konkrete Pflanzenart zu kennen.

```20:24:logic/Garden.ts
return this._plants.reduce((total, plant) => {
  return total + plant.calculateYield(globalMultiplier);
}, 0);
```

- **Abstraktion & Schnittstellen**: Persistenz wird über `ISaveProvider` abstrahiert; `LocalStorageProvider` ist eine konkrete Implementierung.

```1:6:logic/ISaveProvider.ts
export interface ISaveProvider {
  save(data: SaveData): Promise<void>;
  load(): Promise<SaveData | null>;
  clear(): Promise<void>;
}
```

## 3. Klassen- und Komponentenübersicht
### 3.1 GameController (Fassaden-/Orchestrator-Rolle)
- Verantwortlich für Spielfortschritt, Gold/Level, Kauf-/Upgrade-Logik, Achievement-Checks, Biome-Bestimmung, Persistenz.
- Aggregiert `Garden`, nutzt `ISaveProvider`, verarbeitet Templates aus `data/gameData`.
- Beispiel: Tick-Loop akkumuliert GPS und triggert Achievements.

```84:105:logic/GameController.ts
public tick(dtSeconds: number) {
  const gps = this.garden.calculateTotalGPS(this.getGlobalMultiplier());
  this.gold += gps * dtSeconds;
  this.checkAchievements();
  this.notifyListeners();
}
```

### 3.2 Garden (Aggregat für Pflanzen)
- Verwaltet Sammlung von `Plant`-Instanzen, berechnet Gesamtleistung, kapselt Mutationen (add/remove/clear).
- Beispiel: Entfernen eines Pflanzenobjekts erfolgt gekapselt.

```11:15:logic/Garden.ts
public removePlant(plantId: string): void {
  this._plants = this._plants.filter(p => p.id !== plantId);
}
```

### 3.3 Plant-Hierarchie (Abstraktion + Spezialisierung)
- `Plant` definiert gemeinsame Attribute/Verhalten; `Crop` (linear) vs. `Tree` (exponentiell) implementieren spezifische Ertragsfunktionen (SRP erfüllt).
- Upgrade-Mechanik erhöht Level und kumulierten Investitionswert.

### 3.4 Persistenzschicht
- **Schnittstelle**: `ISaveProvider` ermöglicht austauschbare Speicherstrategien (z.B. LocalStorage, Remote API).
- **Implementierung**: `LocalStorageProvider` serialisiert `SaveData` in `localStorage`.

```7:24:logic/LocalStorageProvider.ts
async save(data: SaveData): Promise<void> {
  const json = JSON.stringify(data);
  localStorage.setItem(LocalStorageProvider.KEY, json);
}
```

### 3.5 Statische Domänendaten
- `gameData.ts` enthält Templates (Plants, Upgrades, Achievements) als Single Source of Truth für Kosten, Freischalt-Level, Multiplikatoren und Flavor-Text.
- Beispiel: Achievement-Bedingungen als Funktionen hinterlegt.

```52:58:data/gameData.ts
{ id: 'a5', name: 'Tycoon', description: 'Reach 10,000 GPS.',
  icon: 'bolt', condition: (g, l, p, gps) => gps >= 10000 },
```

## 4. Modellierung und Dokumentation
- **Klassenfindung/Vorgehen**: Domäne trennt klar Zustandsverwaltung (`Garden`), Geschäftsregeln (`GameController`), Entitäten (`Plant`, Spezialisierungen) und Infrastruktur (`ISaveProvider`).
- **Beziehungen (textuelles UML)**:
  - `GameController` —owns→ `Garden`
  - `Garden` —contains→ `Plant*`
  - `Plant` ⇢ `Crop` | `Tree` (Generalization)
  - `GameController` —uses→ `ISaveProvider` ⇢ `LocalStorageProvider` (DI via Konstruktor)
  - `GameController` —uses→ statische Templates aus `data/gameData`
- **Diagramm-Referenzen (draw.io-kompatibel + Markdown-Voransicht)**:
  - Klassendiagramm (Kernlogik): `docs/uml/class-core.drawio`
  - Klassendiagramm (UI & Persistenz): `docs/uml/class-ui-persistence.drawio`
  - Repo/Dateistruktur: `docs/uml/file-structure.drawio`
  - Klassendiagramm (Mermaid Markdown, Schnellansicht): `docs/uml/class-diagram.md`
  - Sequenzdiagramm (Plant-Kauf): `docs/uml/sequence-diagram.md`
- **Dynamische Aspekte**: Tick-Loop (Zeitfortschritt) ruft `calculateTotalGPS`, aktualisiert Gold, prüft Achievements, benachrichtigt UI via Listener.
- **Dok-Infrastruktur**: TSDoc/JSDoc fehlt; Empfehlung: öffentliche Methoden/Konstruktoren annotieren, README ergänzen um API-Abschnitt.

## 5. Implementierungsdetails (OO-Elemente)
- **Klasse vs. Objekt**: Klassen definieren Struktur/Verhalten (`Plant`); Instanzen werden in `GameController.createPlantInstance` erzeugt und im `Garden` gespeichert.
- **Dynamische Bindung**: Laufzeitentscheidung zwischen `Crop`/`Tree` via `calculateYield`.
- **IoC/DI**:
  - `IoCContainer` + `registerDefaultServices`: registriert `saveProvider` und `gameController` als Singletons.
  - Factory `createSaveProvider` liefert `ResilientSaveProvider(LocalStorage → Memory)`, austauschbar durch andere Provider.
  - Reload-Strategie ist injizierbar (testbarer Reset).
- **SRP/DRY**: Ertragslogik pro Spezialisierung, Kauf-/Upgrade-Logik zentralisiert im `GameController`; statische Daten ausgelagert in `data/gameData`.
- **Bounded Context**: Spielkern (Logik) ist von UI (React) getrennt; Persistenz gekapselt.

### 5.1 Fehlerbehandlung & Persistenz
- **ResilientSaveProvider**: Fängt Fehler des primären Providers ab, nutzt Fallback; wirft nur, wenn beide scheitern (UI zeigt Fehler-Toast, Retry).
- **MemorySaveProvider**: Volatil, für Tests/Fallback.
- **Factory**: `createSaveProvider` verknüpft beide zu einer robusten Kette; Austausch gegen andere Provider (z.B. Remote API) möglich.

### 5.2 Dokumentations-Infrastruktur (Definition)
- TSDoc-Kommentare an zentralen Klassen/öffentlichen Methoden (GameController, Garden, Plant-Hierarchie, Save-Provider, IoC) ergänzt; generierbare API-Doku möglich. UI-Komponenten noch offen.

### 5.3 UI-Feedback & Validierung
- Persistenzfehler → PixelToast + Auto-Retry (3s) + manueller Force-Save; Fehlermeldung wird entfernt, wenn Retry erfolgreich.
- Kauf/Upgrade-Calls prüfen Template/Locks/Kapazität; ungültige IDs werden abgewehrt.

## 6. Testen und Qualitätssicherung (detailliert)
- **tests/garden.test.ts**
  - *Mixed plants GPS*: prüft, dass Crop+Tree korrekt summiert werden (40). Erwartung: 40 GPS.
  - *Global multiplier*: prüft Anwendung eines Multiplikators (2x). Erwartung: 20 GPS bei Base 10 Crop.
  - *Tree exponentiell*: validiert 1.5^Level-Skalierung. Erwartung: 22.5 bei Level 2, Base 10.
  - *Remove plant*: sichert korrektes Entfernen. Erwartung: Länge 0 nach remove.

- **tests/unit/gameController.test.ts** (12 Fälle)
  - *Purchase plant senkt Gold*: Kauf p1 (10) reduziert Gold 1000→990, legt Pflanze an.
  - *Capacity limit*: maxGardenSize=1 blockt zweiten Kauf; Erwartung: nur 1 Pflanze.
  - *Upgrade erhöht Level/Value*: Upgrade-Kosten `cost*0.5*level`; Level steigt auf 2, Value erhöht sich um Upgrade-Kosten; Gold sinkt entsprechend.
  - *Global multipliers via upgrades*: zwei Upgrades (u1/u2) ergeben 1.32x; Erwartung: Set-Größe 2, Multiplikator ~1.32.
  - *Persistenz-Roundtrip*: Save/Load stellt Gold/Level/maxGardenSize/Pflanzen wieder her (490 Gold, Level 4, 1 Pflanze).
  - *Achievements (Gold-basiert)*: bei 1.5M Gold werden a2/a6 freigeschaltet; Listener feuert; Save enthält Achievements.
  - *Garden-Upgrades-Kette*: g1/g2 erhöhen Kapazität auf 11; beide Flags gesetzt.
  - *Tycoon (GPS-basiert)*: Vollständiger Upgrade-Stack → GPS ≥ 10k triggert a5.
  - *Reset nutzt injizierten Reload*: `resetGame` ruft injizierbare Funktion; Erwartung: Flag `reloaded=true`.
  - *Persistenz-Fallback bei Fehlern*: ResilientSaveProvider mit failing primary speichert/ lädt über Memory; Erwartung: Gold 42 nach init.
  - *Beide Provider scheitern*: ResilientSaveProvider mit zwei failing Providern → `saveGame` liefert false.
  - *Sell/Upgrade edge?* (nicht abgedeckt) – offen für künftige Tests.

- **Offen / Risiken**
  - UI-Fehlerpfade & Benutzerfeedback bei Persistenzproblemen nicht getestet.
  - E2E-Reset (UI + Storage) fehlt.
  - Weitere Achievement-Fälle (Level-basiert, Pflanzenanzahl) im realen Spielverlauf noch nicht simuliert.

- **Test-Command**
  - `npm run test` (Script in `package.json` → `vitest run`).

## 7. Beispiele für Handlungsziele
- **Analyse**: Abgrenzung der Fachobjekte (Plant/Garden/GameController) anhand der Domänenaktionen „kaufen“, „ernten“, „aufwerten“, „speichern“.
- **Modellierung**: Spezialisierung (Crop vs. Tree), Assoziation (Garden—Plant), Aggregation (Garden verwaltet Plant-Lebenszyklus), Schnittstelle (`ISaveProvider`).
- **Implementierung**: Polymorphe Ertragsberechnung, zentrale Orchestrierung im `GameController`, dynamische Biome-Bestimmung über Level.
- **Überprüfung**: Automatisierte Tests für GPS und Skalierung; fehlende Tests für Controller/Achievements sollten ergänzt werden.

## 8. Erweiterbarkeit und Verbesserungsvorschläge
- **DI/IoC**: Factory oder Injektor einführen, um Provider (`LocalStorageProvider`, ggf. `RemoteApiProvider`) konfigurierbar zu machen.
- **Validierung**: Defensive Checks und Fehler-Handling bei Persistenz (Retry/Toast im UI, Fallback auf Memory-Save).
- **Dokumentation**: TSDoc-Kommentare für öffentliche Methoden, UML-Klassendiagramm (z.B. Plant-Hierarchie, GameController-Beziehungen) ergänzen.
- **Tests**: E2E-ähnliche Controller-Tests mit Fake-Provider; Property-based Tests für Kosten-/Ertrags-Skalierung.
- **Entkopplung UI**: Public API des `GameController` klar dokumentieren, damit UI nur über explizite Methoden interagiert.

## 9. Glossar (Auszug)
- **GPS**: Gold per Second – Gesamtproduktion der Pflanzen unter globalem Multiplikator.
- **Upgrade**: Globaler Multiplikator, der auf alle Pflanzen-Erträge wirkt.
- **Garden Upgrade**: Erhöht `maxGardenSize`, beeinflusst Kauf-Constraints.
- **Achievement**: Freischaltbares Ziel mit Bedingungsfunktion und UI-Benachrichtigung.

