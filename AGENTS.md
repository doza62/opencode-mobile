# AGENTS.md - OpenCode Mobile

## Overview

OpenCode Mobile is a React Native application built with Expo that connects to Server-Sent Events (SSE) servers for real-time messaging and project management. The app follows a refined domain-driven architecture with a three-tier structure: feature modules, shared components/services, and optimized performance patterns.

## Commands

### Build & Development
- **Start development server**: `npm start` or `expo start`
- **Run on iOS**: `npm run ios` or `expo run:ios`
- **Run on Android**: `npm run android` or `expo run:android`
- **Run on web**: `npm run web` or `expo start --web`

### Testing & Validation
- **Syntax check**: `npm run web -- --clear --port 8082` (validates without starting server)
- **Quick validation**: `timeout 10 npm run web -- --clear --port 8082` (runs for 10 seconds to check for errors)
- **Run all tests**: `npm test` or `jest` (Jest is configured but no test files exist yet)
- **Run single test file**: `npm test -- <test-file>.test.js` (when test files are added)
- **Test coverage**: `npm test -- --coverage` (when tests are implemented)

### Linting & Code Quality
- **No linting configured** - ESLint and Prettier should be added for code quality
- **Future lint command**: `npm run lint` (to be added)
- **Future format command**: `npm run format` (to be added)

### Production Builds
- **iOS production**: `npx expo prebuild -p ios && eas build --platform ios`
- **Android production**: `npx expo prebuild -p android && eas build --platform android`

## Code Style Guidelines

### Architecture
- **Three-tier domain-driven design**:
  - **Feature modules**: `features/` with consistent subfolders (components/, hooks/, services/, types/, utils/)
  - **Shared components**: `components/common/` for reusable UI components (SessionDrawer, ThinkingIndicator)
  - **Shared services**: `shared/` for cross-cutting concerns (hooks, constants, helpers, utilities)
- **Component organization**: Hierarchical structure with barrel exports and performance optimizations
- **Hook consolidation**: Shared hooks in `shared/hooks/` with domain-specific hooks in features
- **Import standardization**: `@/` aliases for internal modules with relative paths minimized

### File Structure
```
src/
├── components/         # Component hierarchy
│   ├── common/         # Shared reusable components
│   │   ├── SessionDrawer/  # Relocated drawer component
│   │   └── index.js        # Barrel exports
│   ├── indicators/     # Status indicators
│   ├── layout/         # Layout containers
│   ├── lists/          # List components
│   ├── modals/         # Modal dialogs
│   └── selectors/      # Selection components
├── features/           # Domain-specific modules
│   ├── [domain]/
│   │   ├── components/ # Domain components
│   │   ├── hooks/      # Domain-specific hooks (if any)
│   │   ├── services/   # Domain services
│   │   ├── types/      # Domain types
│   │   └── utils/      # Domain utilities
├── services/           # Cross-cutting services (API, etc.)
├── shared/             # Cross-cutting concerns
│   ├── components/
│   │   └── common/     # Reusable components (ThinkingIndicator)
│   ├── constants/      # App-wide constants
│   ├── helpers/        # Utility functions
│   ├── hooks/          # Shared custom hooks
│   ├── services/       # Shared services
│   ├── types/          # Global types
│   └── utils/          # Shared utilities
├── ChatScreen.js       # Main screen component
└── [other root files]
```

### Imports & Dependencies
- **Module resolution**: Use `@/` alias for `src/` (configured in babel.config.js and metro.config.js)
- **Import standardization**: Prefer `@/` aliases over relative paths (`../../../shared/` → `@/shared/`)
- **Import grouping**: React/React Native first, then external libraries, then internal modules
- **Barrel exports**: Use `index.js` files for clean imports with named exports
- **Performance**: Tree-shakable imports, avoid namespace imports where possible

### Naming Conventions
- **Components**: PascalCase (`ConnectionModal.js`, `StatusBar.js`)
- **Hooks**: camelCase with `use` prefix (`useConnectionStatus.js`, `useSessionDrawerAnimation.js`)
- **Services/Utils**: camelCase (`connectionService.js`, `messageNormalizer.js`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_TIMEOUT`)
- **Files**: Match exported function/class name, PascalCase for components
- **Shared utilities**: Descriptive names (`useAsyncOperation`, `useFormValidation`)

### Formatting
- **Indentation**: 2 spaces (no tabs)
- **Line length**: <100 characters per line
- **Semicolons**: Always required
- **Quotes**: Single quotes for strings, double quotes for JSX attributes
- **Trailing commas**: Required in multi-line objects/arrays
- **Spacing**: Single space around operators, no space in empty object destructuring
- **Import organization**: Group by: React, external libraries, internal modules

### JavaScript/TypeScript
- **No TypeScript**: Uses JSDoc comments for type documentation
- **Type imports**: Import from `shared/types/opencode.types.js`
- **Function documentation**: JSDoc comments for complex functions
- **Prop types**: JSDoc `@param` annotations for component props

### React Patterns
- **Functional components**: Always use function declarations, not arrow functions
- **Hooks**: Shared hooks in `shared/hooks/`, domain hooks in feature directories
- **Props destructuring**: Destructure props in function parameters
- **Event handlers**: `handle` prefix for event handler functions
- **State variables**: Descriptive names, no abbreviations
- **Performance**: Use `React.memo` for pure components, `useMemo` for expensive computations
- **Composition**: Prefer composition over inheritance, use render props where appropriate

### Error Handling
- **Try/catch blocks**: Wrap async operations and external API calls
- **Fallback UI**: Provide graceful degradation for error states
- **Error logging**: Use `console.error()` for debugging, avoid `console.log()` in production
- **User feedback**: Show user-friendly error messages, never crash the app
- **Shared utilities**: Use `useAsyncOperation` for consistent error handling in async operations

### Styling
- **Standardization**: Use `getStyles(theme)` pattern for theme-aware styling
- **StyleSheet API**: React Native's StyleSheet.create() with theme integration
- **Consistent naming**: camelCase for style properties
- **Reusable styles**: Extract common styles to shared constants
- **Theme integration**: All colors use theme values, no hardcoded colors
- **Platform-specific**: Use Platform.select() for platform differences

## Development Workflow

### Adding New Features
1. **Create feature module**: Add new directory under `src/features/` with standard subfolders
2. **Follow structure**: Implement components/, hooks/, services/, types/, utils/
3. **Check shared**: Use existing shared components/hooks from `components/common/` and `shared/`
4. **Update orchestrator**: Integrate with `useSSEOrchestrator.js` if needed
5. **Add to barrel exports**: Update feature `index.js` for clean imports
6. **Performance**: Apply `React.memo` and optimization patterns from start

### Component Creation
1. **Check existing**: Search `components/common/` and `shared/components/` first
2. **Placement strategy**:
   - `components/common/`: Reusable across features (like SessionDrawer)
   - `shared/components/common/`: Cross-domain reusable (like ThinkingIndicator)
   - Feature `components/`: Domain-specific components
3. **Follow patterns**: Use `getStyles(theme)`, `React.memo`, proper imports
4. **Export properly**: Add to appropriate `index.js` barrel export
5. **Testing**: Consider performance impact and memoization needs

### API Integration
1. **Service layer**: Add API calls to `services/api/`
2. **Error handling**: Implement proper error handling and retries
3. **Type safety**: Document API responses with JSDoc types
4. **Caching**: Consider storage layer for offline capabilities

## Testing Strategy

### Test Structure (When Implemented)
- **Unit tests**: Component and hook testing with `@testing-library/react-native`
- **Integration tests**: Feature module testing
- **Test files**: `<component>.test.js` alongside implementation
- **Test utilities**: Shared test helpers in `shared/test/`

### Test Commands (Future)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage reports
- `npm run test:ci` - CI-friendly test run

## Performance Considerations

### React Native Optimization
- **Memoization**: Use React.memo() for expensive components
- **List virtualization**: Use FlatList with proper keyExtractor
- **Image optimization**: Use appropriate image sizes and formats
- **Bundle splitting**: Consider code splitting for large features

### Memory Management
- **Cleanup effects**: Proper cleanup in useEffect return functions
- **Event listeners**: Remove listeners on component unmount
- **SSE connections**: Properly disconnect when not needed

## Security Best Practices

### Data Handling
- **Input validation**: Validate all user inputs and API responses
- **Secure storage**: Use encrypted storage for sensitive data
- **URL validation**: Use `shared/helpers/urlValidation.js` for URLs
- **Error boundaries**: Implement error boundaries for crash prevention

### Network Security
- **HTTPS only**: Ensure all API calls use HTTPS
- **Certificate pinning**: Consider certificate pinning for production
- **CORS handling**: Proper CORS configuration for SSE endpoints

## Deployment & CI/CD

### Build Configuration
- **EAS Build**: Use Expo Application Services for builds
- **Environment variables**: Use `app.config.js` for environment-specific config
- **Build variants**: Separate development, staging, and production builds

### Code Quality Gates
- **Pre-commit hooks**: Add linting and formatting checks
- **Build validation**: Ensure builds pass before merging
- **Test coverage**: Maintain minimum test coverage thresholds

## Tooling & IDE Support

### Development Tools
- **Expo CLI**: Primary development and build tool
- **Metro bundler**: JavaScript bundler for React Native
- **React Native Debugger**: Debug React Native applications

### Recommended Extensions
- **React Native Tools**: VS Code extension for React Native development
- **Expo Tools**: VS Code extension for Expo projects
- **Prettier**: Code formatting (to be added)
- **ESLint**: Code linting (to be added)

## Common Patterns & Utilities

### Custom Hooks
```javascript
// Good: Domain-specific hooks in feature directories
export const useConnectionStatus = () => {
  // Implementation
};

// Avoid: Generic hooks outside feature context
```

### Service Classes
```javascript
// services/api/client.js
export class ApiClient {
  async request(endpoint, options) {
    // Implementation with error handling
  }
}
```

### Type Definitions
```javascript
/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User name
 */
```

## Troubleshooting

### Common Issues
- **Metro bundler issues**: Clear cache with `npx expo start --clear`
- **iOS build failures**: Ensure Xcode is properly configured
- **Android build failures**: Check Android SDK and emulator setup
- **SSE connection issues**: Verify CORS and endpoint availability

### Debug Commands
- **Device logs**: Use `npx expo start` and check device logs
- **Network inspection**: Use React Native Debugger for network requests
- **Performance profiling**: Use Flipper or React DevTools

## Recent Improvements (Completed)

### Structural Refactoring
- **Component relocation**: Moved SessionDrawer to `components/common/`, ThinkingIndicator to `shared/components/common/`
- **Hook consolidation**: Moved `useSessionDrawerAnimation` to `features/sessions/hooks/`, removed duplicate hooks
- **Feature standardization**: Added consistent subfolders (types/, utils/, services/) across all features
- **Import optimization**: Standardized `@/` alias usage, reduced relative path complexity

### Performance Optimizations
- **Component memoization**: Added `React.memo` to key components (SessionBusyIndicator, SessionStatusIndicator, SkeletonItem)
- **Style optimization**: Implemented `useMemo` for expensive style computations
- **List optimization**: Enhanced FlatList with performance props (`removeClippedSubviews`, etc.)
- **Hook optimization**: Added `useCallback` for stable function references

### Code Quality Improvements
- **Styling standardization**: Enforced `getStyles(theme)` pattern with theme integration
- **Shared utilities**: Added `useAsyncOperation` and `useFormValidation` hooks
- **Import robustness**: Fixed all module resolution issues and barrel export inconsistencies
- **Error handling**: Improved async operation error handling patterns

### Latest Structural Fixes (2025-01-03)
- **Component relocation fixes**: Confirmed `ThinkingIndicator` properly located in `shared/components/common/`, updated all imports
- **Hook relocation**: Moved `useSessionDrawerAnimation` from `shared/hooks/` to `features/sessions/hooks/` for domain consistency
- **Hook file organization**: Moved `hooks.js` from `features/sessions/components/` to `features/sessions/hooks/` subfolder
- **Subfolder standardization**: Added missing `types/` subfolders to `features/models/` and `features/notifications/`, added missing `utils/` to `features/todos/`
- **Export cleanup**: Removed broken exports and maintained barrel export consistency across all features

## Logging Guidelines

### Using the Logger Service

The application uses a centralized logging service at `src/shared/services/logger.js`. All logging should use this service instead of direct `console.*` calls.

```javascript
import { logger } from '@/shared/services/logger';

// Create a tagged logger for your feature
const myLogger = logger.tag('MyFeature');

myLogger.debug('Debug message', { data });
myLogger.info('Info message', { data });
myLogger.warn('Warning message', { data });
myLogger.error('Error message', error);
```

### Severity Levels

| Level | When to Use | Examples |
|-------|-------------|----------|
| **ERROR** | Functionality broken, requires attention | Failed API calls, unhandled exceptions, critical failures |
| **WARN** | Potential issues, fallbacks used, deprecated paths | Missing optional data, using fallbacks, deprecated APIs |
| **INFO** | Important state changes, user actions, connection events | User connected, session selected, project loaded |
| **DEBUG** | Detailed flow tracking for development | Message processing steps, SSE events received |

### Tag Naming Conventions

Use PascalCase for tags:
- **Feature-specific**: `SSE`, `Message`, `Session`, `API`, `Storage`
- **Component-specific**: `SessionDrawer`, `ChatInput`, `EventList`
- **Domain-specific**: `Notification`, `DeepLink`, `PushToken`, `Todo`, `Model`

### Message Format

```javascript
// ✅ GOOD
logger.debug('[Tag] Clear action', { key: value });
logger.warn('[API] Failed request', { url, error: error.message });

// ❌ BAD
console.warn('💤 doing something', ...lots, ...of, ...context);
```

### Context-Based Filtering

Enable/disable logging for specific areas:

```javascript
logger.enableContext('SSE_FLOW');   // Enable SSE flow logs
logger.disableContext('SSE_FLOW');  // Disable them
```

### Rate Limiting

Prevent log spam from high-frequency operations:

```javascript
// Creates a rate-limited logger (max 1 log per second)
const filteredLogger = logger.rateLimit('SessionFilter', 1);
filteredLogger.debug('This logs max once per second');
```

### Performance Tracking

Track operation durations:

```javascript
logger.timeStart('myOperation');
// ... do work ...
const result = logger.timeEnd('myOperation');
if (result?.slow) {
  logger.warn('Slow operation detected', result);
}
```

### When NOT to Log

- ❌ Component renders (use React DevTools)
- ❌ Every iteration of a loop (use rate limiting)
- ❌ Data dumps (log counts/summaries instead)
- ❌ Sensitive information (passwords, tokens, etc.)

### Configuration

Log levels are environment-based:
- **Development**: DEBUG level (all logs enabled)
- **Production**: WARN level (only warnings and errors)

Override at runtime:
```javascript
logger.setLevel('DEBUG'); // Enable all logs
logger.setLevel('ERROR'); // Only errors
```

## Future Improvements

### Planned Additions
- **ESLint configuration**: Add code linting rules with import alias enforcement
- **Prettier configuration**: Configure for consistent formatting
- **Testing framework**: Implement comprehensive test suite for optimized components
- **TypeScript migration**: Consider migrating to TypeScript with existing patterns
- **Component library**: Expand design system with standardized components

This guide should be updated as the codebase evolves and new patterns emerge.</content>
<parameter name="filePath">/Users/rodri/Projects/opencode-mobile/opencode-mobile/AGENTS.md