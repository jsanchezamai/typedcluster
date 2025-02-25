# Contributing to IoT Cluster Simulator VS Code Extension

## Development Setup

1. **Prerequisites**
   - Node.js 18.x or higher
   - Visual Studio Code 1.85.0 or higher
   - TypeScript knowledge
   - VS Code Extension development experience

2. **Local Development**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd iot-cluster-simulator

   # Install dependencies
   npm install

   # Compile TypeScript
   npm run compile

   # Watch for changes during development
   npm run watch
   ```

## Architecture Overview

### Core Components

1. **Tree Views**
   - `SimulationTreeProvider`: Manages the simulation tree view
   - `ClusterNodeTreeProvider`: Handles cluster node visualization

2. **Status Panels**
   - `ClusterStatusPanel`: Real-time cluster monitoring
   - Node details webview panel

3. **Services**
   - `SimulationManager`: Core simulation logic
   - `FileManager`: Data persistence
   - `TelemetryGenerator`: Sensor data simulation

### Data Flow

```
User Input -> VS Code Commands -> SimulationManager -> Tree Views/Panels -> UI Updates
```

## Code Organization

```
src/
├── models/          # Data models
├── panels/         # Webview panels
├── services/       # Business logic
├── test/          # Test files
├── types/         # TypeScript types
├── utils/         # Utilities
├── views/         # Tree views
└── extension.ts   # Extension entry point
```

## Testing

1. **Unit Tests**
   - Located in `src/test/suite/`
   - Run with `npm test`
   - Focus on individual component testing

2. **Integration Tests**
   - Test extension activation
   - Verify command registration
   - Check tree view functionality

3. **Manual Testing**
   - Launch extension in debug mode (F5)
   - Test all UI components
   - Verify data persistence

## Best Practices

1. **Code Style**
   - Follow TypeScript best practices
   - Use meaningful variable names
   - Add JSDoc comments for public APIs

2. **Error Handling**
   - Use try-catch blocks
   - Provide user-friendly error messages
   - Log errors for debugging

3. **Performance**
   - Minimize UI updates
   - Use efficient data structures
   - Implement proper dispose patterns

## Making Changes

1. Create a feature branch
2. Make changes following guidelines
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

## Common Development Tasks

1. **Adding a New Command**
   ```typescript
   // In extension.ts
   context.subscriptions.push(
       vscode.commands.registerCommand('iotSimulator.newCommand', async () => {
           // Implementation
       })
   );
   ```

2. **Creating a New Tree View**
   ```typescript
   export class NewTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
       // Implementation
   }
   ```

3. **Adding Status Panel Features**
   ```typescript
   export class NewPanel {
       private static createWebviewContent(): string {
           // HTML content
       }
   }
   ```

## Debugging Tips

1. Use VS Code's built-in debugger
2. Check Debug Console for logs
3. Use extension development host
4. Monitor memory usage

## Release Process

1. Update version number
2. Run all tests
3. Update changelog
4. Build and package extension
5. Test in clean environment
6. Submit for publishing
