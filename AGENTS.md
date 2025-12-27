# AGENTS.md - Opencode Mobile

## Commands
- **Syntax check**: `npm run web -- --clear` (validates without starting server)
- **No lint/test commands** - add ESLint/Prettier if needed
- **No test runner** - add Jest if tests are added

## Development Workflow
- **Syntax Validation**: Always run `npm run web -- --clear` after edits
- **Server Hosting**: User hosts dev server separately in different terminal
- **File Changes**: Validate changes don't break app before committing

## Code Style Guidelines

### Architecture
- **Domain-driven structure**: `features/` for business logic, `services/` for external APIs
- **Feature modules**: Each domain in `features/[domain]/` with `hooks/`, `services/`, `utils/`, `types/`
- **Shared utilities**: Cross-cutting concerns in `shared/` (types, constants, helpers)

### Imports
- **Centralized exports**: Import from `features/` index for feature modules
- **Relative paths**: Use relative imports within feature modules
- **Group imports**: React/React Native first, then local modules

### Formatting
- **2 spaces indentation**, semicolons required, single quotes, trailing commas
- **Line length**: Keep under 100 characters where possible

### Naming
- **Components**: PascalCase (`MessageList`, `StatusBar`)
- **Hooks**: camelCase with `use` prefix (`useSSEConnection`)
- **Files**: PascalCase for components, camelCase for hooks/utils
- **Constants**: UPPER_SNAKE_CASE in constants files

### Types
- **JSDoc comments**: `/** @param {string} url */` for function parameters
- **Type references**: Import from `shared/types/opencode.types.js`
- **No TypeScript**: Stick to JavaScript with JSDoc

### Error Handling
- **Try/catch** for async operations with graceful fallbacks
- **Console logging**: `console.error()` for errors, `console.log()` for debug
- **Never crash**: Always provide fallbacks for error states

### React Patterns
- **Functional components** with hooks, no class components
- **Custom hooks** in feature `hooks/` directories
- **State management**: `useState` for local state, feature hooks for shared state
- **Effects**: `useEffect` for side effects with proper cleanup

### Best Practices
- **Single responsibility**: Keep functions small and focused
- **Meaningful names**: Use descriptive variable/function names
- **No comments**: Unless explaining complex business logic
- **Consistent patterns**: Follow existing codebase patterns
