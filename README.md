# GreenOps - Garden

GreenOps is a small browser-based gardening simulation built with TypeScript and Vite. It models plants, trees and a garden controller, and includes simple persistence providers for local development and testing.

## Highlights
- TypeScript-first architecture with clear domain classes (`Plant`, `Tree`, `Garden`, etc.).
- Small IoC/DI setup and multiple save providers (memory, localStorage, resilient provider).
- Unit tests for core logic (see `tests/`).

## Quick Start
1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Run tests:

```bash
npm test
```

## Project Structure (important files)
- `index.html`, `index.tsx`, `App.tsx` — entry points and React setup.
- `components/` — UI components and pixel-art assets.
- `logic/` — core domain logic: `Plant.ts`, `Tree.ts`, `Garden.ts`, controllers and save providers.
- `tests/` — unit tests for core functionality.
- `docs/` and `dokumentations/` — UML and project documentation.

## Development notes
- The domain lives in `logic/`. Look into `Garden.calculateTotalGPS()` for GPS aggregation logic.
- Save providers implement `ISaveProvider` and can be swapped via `registerServices.ts`.

## Credits
This project was created by Linus Klee.

## License
Uhhhh idk I haven't thought of allat.....
