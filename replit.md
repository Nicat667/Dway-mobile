# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Notion Companion (Mobile App)
- **Type**: Expo React Native
- **Path**: `artifacts/notion-companion/`
- **Features**:
  - **Plan Tab**: Task management with Daily/Weekly/Monthly/Yearly periods, category filter chips, task creation with alarm clock, timer button (bottom left), AI Mother floating button (bottom right above + FAB)
  - **Progress Tab**: Weekly/Monthly/Yearly stats with circular progress indicators, per-category breakdown with progress bars, AI-generated insights (2 positive, 1 negative)
  - **Community Tab**: Activity feed with likes/comments, challenges with progress tracking
  - **Profile Tab**: Stats display, achievements, alarm sound picker, notification settings
  - **Add Task Modal**: Title input with clock icon for alarm, category chips + add new category, priority selector, alarm time picker
  - **AI Mother Modal**: Chat interface with preset suggestions, context-aware responses based on task stats
  - **Timer Modal**: Focus/Short/Long break pomodoro timer

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
