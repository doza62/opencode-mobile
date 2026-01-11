# AGENTS.md - src/shared

**Last Updated:** 2026-01-10
**Scope:** Universal logic, utilities, and infrastructure.

## OVERVIEW
The "Pure Logic" layer of OpenCode Mobile. This directory contains code that is agnostic to specific features and provides the foundation for the entire application. 

**CRITICAL:** No UI components (JSX/TSX) are allowed to be authored here. Any existing UI components must be migrated to `src/components/`.

## STRUCTURE
```
src/shared/
├── services/   # Infrastructure singletons (API, Logger, Storage)
├── hooks/      # Generic logic hooks (useAsyncOperation, useKeyboardState)
├── utils/      # Pure functions and small helper logic
├── constants/  # Global configuration (API endpoints, theme tokens)
├── helpers/    # Complex shared logic (validation, formatting)
└── types/      # Global JSDoc definitions (opencode.types.js)
```

## CONVENTIONS
- **Singleton Services**: Infrastructure like `api/client.js` and `logger.js` must be exported as singletons.
- **Generic First**: Code here must be reusable across multiple features. If it depends on feature-specific logic, it belongs in `src/features/`.
- **JSDoc Types**: All global type definitions reside in `src/shared/types/opencode.types.js`.
- **Logger Usage**: Every service/hook must use `logger.tag('Shared:Name')` for traceability.
- **Async Safety**: Use `useAsyncOperation` for all async logic to ensure uniform error handling.

## ANTI-PATTERNS (STRICT)
- **NO UI COMPONENTS**: Do not create components in `src/shared/components`. Move them to `src/components/` or `src/features/`.
- **NO Feature Logic**: Never import from `src/features/` into `src/shared/`.
- **NO State Management**: Shared hooks should manage local state or side effects, not global application state (Redux/Context providers belong in `src/context/` or `src/features/`).
- **NO Direct Console**: `console.log` is forbidden. Use `logger`.

## CORE UTILITIES
| Utility | Path | Purpose |
|---------|------|---------|
| **API** | `services/api/client.js` | Axios instance with auth/interceptors |
| **Logger**| `services/logger.js` | Custom logging with tags and levels |
| **Async** | `hooks/useAsyncOperation.js` | Standardized async execution & loading state |
| **Types** | `types/opencode.types.js` | Source of truth for all JSDoc types |
