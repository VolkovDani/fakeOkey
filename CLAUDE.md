# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Okey 101 — multiplayer browser board game with WebSocket communication. Russian-speaking user.

## Commands

```bash
npm install              # install all workspace dependencies
npm run dev              # start client + server concurrently
npm run dev:client       # Vite dev server (port 5173)
npm run dev:server       # WebSocket server (port 3001)
npm run prod             # production: preview client + server
npm run prod:client:build # build client for production

# Type-checking (root tsconfig.json covers shared options)
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit --esModuleInterop --module ESNext --moduleResolution bundler --target ES2020 --strict --skipLibCheck index.ts

# Tests
npm run test -w shared   # vitest in shared workspace

# Build client
cd client && npx vite build
```

## Architecture

Three npm workspaces: `client`, `server`, `shared`.

**shared/** — pure TypeScript types (`types.ts`) and game logic functions (`gameLogic.ts`). Has unit tests (`gameLogic.test.ts`, vitest). No runtime dependencies. Imported by both client and server as `from 'shared/types'` and `from 'shared/gameLogic'` via npm workspaces.

**server/index.ts** — single-file WebSocket server (`ws` package, port 3001). Manages rooms, game state, turn validation, tile dealing, meld validation, and score calculation. All game state lives in-memory in `Room` and `ServerPlayer` objects. Each player gets a personalized `GameState` (sees only their own hand). Messages are typed as `ClientMessage` / `ServerMessage`.

**client/** — React 19 + Vite 8 + TypeScript. The Vite dev server proxies `/ws` to `ws://localhost:3001` so the client connects to WebSocket on the same port. Core hook `useWebSocket.ts` manages connection, auto-reconnect, and state dispatch. `App.tsx` routes between phases: lobby → playing → round_end → game_over.

Key client modules:
- `i18n/` — internationalization (ru/en), context-based (`I18nContext.tsx`, `useI18n.ts`).
- `components/DisconnectOverlay.tsx` — overlay shown when a player disconnects mid-game.
- `components/GameBoard.tsx` — main game view (hand, melds, draw area, opponents).

**Dockerfile** — single-stage Node 25 image: installs deps, builds client, runs `npm run prod` (preview + server on port 3000).

## Key Conventions

- All imports from shared use the workspace module name: `from 'shared/types'`, not relative paths.
- Client uses `import { type X }` syntax (not `import type`) due to `verbatimModuleSyntax`.
- All components use inline styles, no CSS modules or styled-components.
- Server validates all game actions; client is display-only and sends intents via `ClientMessage`.
- i18n: all user-facing strings go through `useI18n()` hook (`t('key')`).
