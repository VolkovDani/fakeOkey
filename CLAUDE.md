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

# Type-checking
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit --esModuleInterop --module ESNext --moduleResolution bundler --target ES2020 --strict --skipLibCheck index.ts

# Build client
cd client && npx vite build
```

## Architecture

Three npm workspaces: `client`, `server`, `shared`.

**shared/** — pure TypeScript types (`types.ts`) and game logic functions (`gameLogic.ts`). No runtime dependencies. Imported by both client and server as `from 'shared/types'` and `from 'shared/gameLogic'` via npm workspaces.

**server/index.ts** — single-file WebSocket server (`ws` package, port 3001). Manages rooms, game state, turn validation, tile dealing, meld validation, and score calculation. All game state lives in-memory in `Room` and `ServerPlayer` objects. Each player gets a personalized `GameState` (sees only their own hand). Messages are typed as `ClientMessage` / `ServerMessage`.

**client/** — React + Vite + TypeScript. The Vite dev server proxies `/ws` to `ws://localhost:3001` so the client connects to WebSocket on the same port. Core hook `useWebSocket.ts` manages connection, auto-reconnect, and state dispatch. `App.tsx` routes between phases: lobby → playing → round_end → game_over.

## Key Conventions

- All imports from shared use the workspace module name: `from 'shared/types'`, not relative paths.
- Client uses `import { type X }` syntax (not `import type`) due to `verbatimModuleSyntax`.
- All components use inline styles, no CSS modules or styled-components.
- Server validates all game actions; client is display-only and sends intents via `ClientMessage`.
