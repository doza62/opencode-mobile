# src/components - UI Components

**Generated:** 2026-01-10
**Context:** Presentational Components, Theming, Performance

## OVERVIEW
Dumb/Presentational components only. This directory contains the building blocks of the UI. Components here must be stateless (regarding business logic) and should not initiate any side effects. They receive data and callbacks via props.

## STRUCTURE
| Category | Purpose | Examples |
|----------|---------|----------|
| **layout** | Screen structure & positioning | `StatusBar.js`, `ActionButtons.js` |
| **common** | Shared UI elements | `DarkModeToggle.js`, `SessionDrawer/` |
| **lists** | List item & container components | `SessionListItem.js` |
| **modals** | Overlay-based interactions | `LogModal.js`, `AgentSelectorModal.js` |
| **selectors** | Data/Option picking components | `ProjectSelector` (in drawer) |
| **indicators** | Feedback & status elements | `ConnectionStatusIndicator.js` |

## CONVENTIONS
- **Theming**: Use the `getStyles(theme)` pattern (often implemented as `createStyles` functions in separate `styles.js` or `utils/` files). Never hardcode colors.
- **Performance**: Wrap ALL components in `React.memo()` to prevent unnecessary re-renders in the high-frequency SSE environment.
- **Typing**: Use JSDoc `@param` for all props to maintain clarity.
- **Communication**: Use callback props (e.g., `onPress`, `onSelect`) to communicate user actions back to parents/hooks.

## ANTI-PATTERNS (STRICT)
- **NO Business Logic**: Do not calculate state or process data here. Use `features/` hooks.
- **NO API Calls**: Direct usage of `axios`, `fetch`, or `apiClient` is forbidden.
- **NO Hardcoded Dimensions**: Avoid fixed `width`/`height`. Use `useWindowDimensions()` or `useSafeAreaInsets()` for responsiveness.
- **NO Global State**: Do not connect components directly to global stores/contexts (except `ThemeProvider`).
