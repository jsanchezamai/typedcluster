# IoT Cluster Simulator VS Code Extension - Developer Guide

## Architecture Overview

### Core Components

1. **Extension Entry Point (`src/extension.ts`)**
   - Handles extension activation/deactivation
   - Registers commands and views
   - Initializes the simulation manager
   - Sets up status bar and monitoring intervals

2. **Simulation Manager (`src/services/SimulationManager`)**
   - Core business logic for simulation handling
   - Manages cluster state and configuration
   - Handles load balancing and failure recovery
   - Coordinates sensor simulation and data generation

3. **Tree Views**
   - `SimulationTreeProvider`: Manages simulation hierarchy and status
   - `ClusterNodeTreeProvider`: Visualizes cluster nodes and their metrics

4. **Status Panels**
   - `ClusterStatusPanel`: Real-time cluster monitoring
   - Node details webview panel
   - Custom HTML/CSS styling using VS Code theming

### Data Flow

```
User Input -> VS Code Commands -> SimulationManager -> Tree Views/Panels -> UI Updates
```

## Development Setup

### Prerequisites
- Node.js 18.x or higher
- Visual Studio Code 1.85.0 or higher
- TypeScript knowledge
- VS Code Extension development experience

### Installation
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch
```

## Code Organization

```
src/
├── models/          # Data models and interfaces
├── panels/         # Webview panel implementations
├── services/       # Business logic and managers
├── test/          # Test files and configurations
├── types/         # TypeScript type definitions
├── utils/         # Utility functions and helpers
├── views/         # Tree view providers
└── extension.ts   # Extension entry point
```

## Testing Framework

### Unit Tests Configuration
```typescript
// src/test/suite/index.ts
import * as path from 'path';
import Mocha from 'mocha';
import glob from 'glob';

export function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });
    // ... test configuration
}
```

### Writing Tests
```typescript
// Example test structure
suite('IoT Cluster Simulator Extension Test Suite', () => {
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('your.extension-id'));
    });

    test('Tree views should be registered', async () => {
        // Test implementation
    });
});
```

## Database Management

### Using Drizzle ORM
- Models defined in `shared/schema.ts`
- Use `npm run db:push` for migrations
- Never write raw SQL migrations
- Handle data loss warnings appropriately

### Connection Management
```typescript
// Example database connection
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool);
```

## Debugging

### VS Code Launch Configuration
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Extension",
            "type": "extensionHost",
            "request": "launch",
            "runtimeExecutable": "${execPath}",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}"
            ]
        }
    ]
}
```

### Logging Best Practices
- Use console.log for development debugging
- Implement proper error handling
- Add logging in key methods:
  - Tree view updates
  - Command execution
  - Panel creation/disposal

### Common Debug Points
1. Tree View Updates
```typescript
private async getChildren(): Promise<vscode.TreeItem[]> {
    console.log('Fetching children for tree view');
    // Implementation
}
```

2. Panel Updates
```typescript
private _update() {
    console.log('Updating panel with data:', this._getData());
    // Implementation
}
```

## Extension Packaging

### Preparing for Release
1. Update version in package.json
2. Run all tests
3. Update changelog
4. Build and package:
   ```bash
   vsce package
   ```

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Clean build successful

## Best Practices

### Code Style
- Follow TypeScript best practices
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Implement proper dispose patterns

### Error Handling
```typescript
try {
    await this.simulationManager.addSimulation(simulation);
    vscode.window.showInformationMessage('Success');
} catch (err) {
    console.error('Error:', err);
    vscode.window.showErrorMessage(`Failed: ${err.message}`);
}
```

### Performance Considerations
- Minimize UI updates
- Use efficient data structures
- Implement proper dispose patterns
- Cache frequently accessed data

## Contributing Guidelines

### Pull Request Process
1. Create feature branch
2. Make changes following guidelines
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

### Code Review Checklist
- [ ] Follows TypeScript best practices
- [ ] Includes appropriate tests
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Performance considered
