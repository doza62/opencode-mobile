# AGENTS.md - OpenCode Mobile

**Generated:** 2026-01-10
**Context:** Expo (v54), React Native, Server-Sent Events (SSE)

## OVERVIEW
React Native mobile app for real-time SSE event streaming. Uses a Three-Tier Domain-Driven Design (DDD) with `ChatScreen.js` as the central orchestration hub. Built with Expo and EAS.

## STRUCTURE
```
src/
├── ChatScreen.js             # "God Component" - Main orchestration, navigation, & layout
├── features/                 # Domain logic (sessions, messaging, connection)
│   ├── {feature}/
│   │   ├── components/       # Feature-specific UI
│   │   ├── hooks/            # Feature logic
│   │   ├── services/         # API & business logic
│   │   └── types/            # JSDoc types
├── components/               # Reusable UI (layout, common, lists)
└── shared/                   # Cross-cutting (logger, api, theme)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| **Navigation** | `src/ChatScreen.js` | Manual state-based navigation (no React Navigation for main flow) |
| **SSE Logic** | `src/features/connection/hooks/useSSEOrchestrator.js` | Central brain for event handling |
| **Logging** | `src/shared/services/logger.js` | **Mandatory** usage (no console.log) |
| **Theming** | `src/shared/components/ThemeProvider.js` | Via `getStyles(theme)` pattern |
| **API** | `src/shared/services/api/client.js` | Axios wrapper |

## CONVENTIONS
- **Architecture**: `features/` (Domain) → `components/` (UI) → `shared/` (Utils).
- **Aliases**: Use `@/` for `src/`.
- **Styling**: `getStyles(theme)` returning `StyleSheet.create`. No hardcoded colors (except specific indicators).
- **Testing**: Co-located `*.test.js` files using Jest.
- **Async**: Wrap ALL async ops in `try/catch` with `logger.error`. Use `useAsyncOperation`.
- **Types**: JSDoc only. No TypeScript files (`.ts/.tsx`) despite config support.

## ANTI-PATTERNS (STRICT)
- **NO `console.log`**: usage is lint-forbidden. Use `logger.tag('Context').debug()`.
- **NO Logic in UI**: Move business logic to custom hooks in `features/{name}/hooks/`.
- **NO Components in `shared/`**: UI belongs in `src/components/` or `src/features/{name}/components/`.
- **NO Hardcoded Colors**: Use `theme.colors` from props/context.
- **NO "God Hooks"**: Split large hooks (like `hooks.js`) into single-purpose files.

## COMMANDS
```bash
# Dev
npm start             # Start Expo
npm run ios           # Sim (requires Xcode)
npm run android       # Sim (requires Studio)

# Test
npm test              # Run Jest
npm run test:coverage # Generate report

# Build
eas build --profile development --platform ios
```
