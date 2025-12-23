# Abgleich Handlungsziele ↔ Umsetzung (Application Engineering)

## 1. OOP-Grundkonzepte
- **Kapselung**: Private Felder + Getter in `Plant`; Garden kapselt Mutationen.
- **Vererbung/Spezialisierung**: `Crop`, `Tree` erweitern `Plant`.
- **Polymorphie/dynamische Bindung**: `Garden.calculateTotalGPS` ruft `calculateYield` polymorph.
- **Abstraktion/Schnittstellen**: `ISaveProvider` mit Implementierungen (`LocalStorageProvider`, `MemorySaveProvider`, `ResilientSaveProvider`).
- **Sammlungen/ADT**: Arrays für Pflanzen, `Set` für Upgrades/Achievements, `enum BiomeType`, getypte Templates (`PlantData`, `UpgradeData`, ...).

## 2. Klassenfindung / Prinzipien
- **SRP/DRY**: Ertragslogik in Spezialisierungen; Orchestrierung im `GameController`; Persistenz abstrahiert; Daten in `gameData.ts`.
- **Bounded Context**: Logik getrennt von UI; Persistenz gekapselt.
- **Generalization/Spezialisierung**: Plant-Basis, Crop/Tree als Spezialisierungen.

## 3. Modellierung & Dokumentation
- **UML/Diagramme**: draw.io-Klassendiagramme (`docs/uml/class-core.drawio`, `class-ui-persistence.drawio`), Strukturdiagramm, Sequenz (Plant-Kauf), Mermaid-Ansicht.
- **Dok-Infrastruktur**: TSDoc an Kern-APIs (Controller, Garden, Plant, Provider, IoC); API maschinenlesbar, Generator-fähig. UI-Komponenten optional nachrüstbar.

## 4. Implementierung (OO-Sprache/IoC)
- **Sprache/Elemente**: TypeScript-Klassen, abstrakte Klassen, Interfaces, Enums.
- **Dynamische Bindung**: polymorphes `calculateYield`.
- **IoC/DI**: `IoCContainer` + `registerDefaultServices` (Singletons für `saveProvider`, `gameController`); Factory liefert `ResilientSaveProvider(LocalStorage→Memory)`; `reloadFn` injizierbar.

## 5. Fehlerbehandlung & Validierung
- **Persistenz**: ResilientSaveProvider fällt auf Memory zurück, wirft nur bei doppeltem Fehler; `saveGame` gibt bool zurück.
- **UI-Feedback/Retry**: PixelToast bei Save-Fehler, Auto-Retry (3s), manueller Force-Save meldet Fehler.
- **Eingabe-Guards**: Kauf/Upgrade prüfen Kapazität, 5-per-Type, Template-Existenz, Unlock-Kette.

## 6. Tests (aktueller Stand)
- **Garden-Tests**: GPS-Mix, Global-Multiplier, exponentielle Trees, Remove.
- **GameController-Tests (12)**: Kauf/Gold, Kapazitätslimit, Upgrade-Kosten/Value, globale Multiplikatoren, Persistenz-Roundtrip, Achievements (Gold/Tycoon GPS), Garden-Upgrades-Kette, Reset mit injizierbarem Reload, Persistenz-Fallback (Primary fail), doppelter Provider-Fail → `saveGame=false`.
- **Offen**: UI-Fehlerpfade/E2E-Reset, weitere Achievement-Szenarien unter realem Spielverlauf.

## 7. Anforderungen vs. Umsetzung
- **Analysieren (g4.1/g4.4)**: Domänenobjekte klar getrennt; SRP/Bounded Context beachtet.
- **Modellieren/Dokumentieren (g4.4)**: UML/Sequenz vorhanden; TSDoc für Kern-APIs; ausführliche MD-Doku im Ordner `dokumentations/`.
- **Implementieren (g5.2/g5.5)**: OO-Sprachelemente, dynamische Bindung, DI/IoC umgesetzt.
- **Überprüfen (g5.4/g6.x)**: Unit-Tests für Kernlogik, Persistenz-Fallback, Achievements; noch Lücken bei UI/E2E.

## 8. Empfehlungen (Restlücken)
- UI-/E2E-Tests für Fehlerpfade (Persistenzfehler, Reset).
- TSDoc für UI-Komponenten ergänzen.
- Optionale Retry-Strategie (Backoff) und sichtbarer Fallback-Hinweis im UI.

