# AGENTS.md - Features Directory

**Generated:** 2026-01-10
**Context:** Domain-Driven Design (DDD), Feature Isolation

## OVERVIEW
The `src/features` directory contains the core domain logic of the application. Each folder represents a self-contained **Feature Module**. 
- **Isolation Rule**: Features must be encapsulated. Business logic, state, and feature-specific UI live here.
- **Communication**: Inter-feature communication must happen only through the public API defined in each feature's `index.js`.

## STRUCTURE
Every feature should follow this standard layout:
```
{feature_name}/
├── components/   # Feature-specific UI components
├── hooks/        # Domain logic, state management, and side effects
├── services/     # API calls, storage interactions, and business logic
├── types/        # JSDoc type definitions (*.types.js)
├── utils/        # Internal helper functions
└── index.js      # Public API (Barrel export)
```

## CONVENTIONS
- **Barrel Exports**: Every feature MUST have an `index.js` that exports only what is necessary for other features or the main `ChatScreen`.
- **Hook Naming**: Use the `use[Feature][Action]` pattern (e.g., `useSessionManagement`, `useSSEConnection`).
- **Documentation**: Use JSDoc in `types/` files to define data structures. Reference these in hooks and components.
- **Logic Placement**: Prefer hooks for stateful logic and services for stateless business logic or API interactions.

## ANTI-PATTERNS
- **NO Deep Imports**: Never import from `src/features/feature-a/components/InternalComponent`. Use `src/features/feature-a`.
- **NO Generic UI**: If a component is reused across multiple features (e.g., a custom Button), move it to `src/components/`.
- **NO Circular Dependencies**: If Feature A needs Feature B and vice versa, move the shared logic to `src/shared` or a new feature.
- **NO Raw API Calls in Components**: All network logic belongs in `services/` and should be accessed via `hooks/`.
