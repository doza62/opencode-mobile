# AGENTS.md - OpenCode Mobile

## Overview

OpenCode Mobile is a React Native application built with Expo that connects to Server-Sent Events (SSE) servers for real-time messaging and project management. The app follows a domain-driven architecture with feature modules, shared services, and organized component hierarchies.

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
- **Domain-driven design**: Code organized into `features/` with hooks/services/utils/types
- **Feature modules**: Each domain (`connection/`, `messaging/`, `projects/`, etc.) contains complete functionality
- **Service layer**: `services/` for external integrations (API, SSE, storage)
- **Shared layer**: `shared/` for cross-cutting concerns (types, constants, helpers)
- **Component organization**: Components grouped by type (`common/`, `layout/`, `modals/`, `selectors/`)

### File Structure
```
src/
├── features/           # Domain-specific modules
│   ├── [domain]/
│   │   ├── components/ # Domain components
│   │   ├── hooks/      # React hooks
│   │   ├── services/   # External services
│   │   ├── types/      # Domain types
│   │   └── utils/      # Domain utilities
├── services/           # Cross-cutting services
├── shared/             # Shared utilities
├── screens/            # Screen components
└── components/         # Organized by type
```

### Imports & Dependencies
- **Module resolution**: Use `@/` alias for `src/` (configured in babel.config.js)
- **Import grouping**: React/React Native imports first, then relative imports
- **Relative imports only**: No absolute imports except `@/` alias
- **Barrel exports**: Use `index.js` files for clean imports from directories

### Naming Conventions
- **Components**: PascalCase (`ConnectionModal.js`, `StatusBar.js`)
- **Hooks**: camelCase with `use` prefix (`useConnectionStatus.js`, `useSSEOrchestrator.js`)
- **Services/Utils**: camelCase (`connectionService.js`, `messageNormalizer.js`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_TIMEOUT`)
- **Files**: Match exported function/class name, PascalCase for components

### Formatting
- **Indentation**: 2 spaces (no tabs)
- **Line length**: <100 characters per line
- **Semicolons**: Always required
- **Quotes**: Single quotes for strings, double quotes for JSX attributes
- **Trailing commas**: Required in multi-line objects/arrays
- **Spacing**: Single space around operators, no space in empty object destructuring

### JavaScript/TypeScript
- **No TypeScript**: Uses JSDoc comments for type documentation
- **Type imports**: Import from `shared/types/opencode.types.js`
- **Function documentation**: JSDoc comments for complex functions
- **Prop types**: JSDoc `@param` annotations for component props

### React Patterns
- **Functional components**: Always use function declarations, not arrow functions
- **Hooks**: Custom hooks in feature directories, useState/useEffect patterns
- **Props destructuring**: Destructure props in function parameters
- **Event handlers**: `handle` prefix for event handler functions
- **State variables**: Descriptive names, no abbreviations

### Error Handling
- **Try/catch blocks**: Wrap async operations and external API calls
- **Fallback UI**: Provide graceful degradation for error states
- **Error logging**: Use `console.error()` for debugging, avoid `console.log()` in production
- **User feedback**: Show user-friendly error messages, never crash the app

### Styling
- **StyleSheet API**: Use React Native's StyleSheet.create()
- **Consistent naming**: camelCase for style properties
- **Reusable styles**: Extract common styles to shared constants
- **Platform-specific**: Use Platform.select() for platform differences

## Development Workflow

### Adding New Features
1. **Create feature module**: Add new directory under `src/features/`
2. **Follow structure**: Implement hooks/services/utils/types/components
3. **Update orchestrator**: Integrate with `useSSEOrchestrator.js` if needed
4. **Add to barrel exports**: Update `index.js` files for clean imports

### Component Creation
1. **Check existing**: Search for similar components before creating new ones
2. **Place appropriately**: Use `common/` for reusable, feature directories for specific
3. **Follow patterns**: Use established naming and structure conventions
4. **Export properly**: Add to appropriate `index.js` barrel export

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

## Future Improvements

### Planned Additions
- **ESLint configuration**: Add code linting rules
- **Prettier configuration**: Add code formatting
- **Testing framework**: Implement comprehensive test suite
- **TypeScript migration**: Consider migrating to TypeScript
- **Component library**: Standardize design system components

This guide should be updated as the codebase evolves and new patterns emerge.</content>
<parameter name="filePath">/Users/rodri/Projects/opencode-mobile/opencode-mobile/AGENTS.md