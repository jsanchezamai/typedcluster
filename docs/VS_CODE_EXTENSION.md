# IoT Cluster Simulator VS Code Extension

A powerful Visual Studio Code extension for managing and monitoring IoT cluster simulations. This extension provides an intuitive interface for controlling IoT cluster operations, monitoring performance metrics, and managing simulation configurations directly from your VS Code environment.

## Features

- 🖥️ Interactive cluster management interface
- 📊 Real-time performance monitoring
- 🔄 Simulation lifecycle management
- ⚙️ Advanced configuration options
- 📝 Detailed logging and tracing
- 🎮 Command palette integration

## Documentation

The project uses TypeDoc for API documentation generation. Documentation is automatically generated from source code comments and can be found in the `docs/api` directory.

### Generating Documentation

To regenerate the documentation:

```bash
npm run docs:generate
```

This will create/update the API documentation in Markdown format in the `docs/api` directory.

### Documentation Structure

- `docs/api` - Generated API documentation
- `docs/VS_CODE_EXTENSION.md` - Main extension documentation (this file)
- `docs/CONTRIBUTING.md` - Contribution guidelines
- `docs/DEVELOPER.md` - Developer guide
- `docs/troubleshooting.md` - Troubleshooting guide

For development-related documentation, please refer to our [Developer Guide](DEVELOPER.md).

## Installation

1. Download the VSIX package from the releases page
2. Install in VS Code:
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
   - Type "Install from VSIX"
   - Select the downloaded package

## Usage
### Starting a New Simulation

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Type "IoT Cluster: New Simulation"
3. Follow the configuration wizard to set up:
   - Simulation name and description
   - Number of nodes
   - Work type and strategy
   - Data directory location

### Managing Clusters

The extension provides a dedicated view container for cluster management:

- **Simulation Explorer**: Lists all active simulations
- **Node Monitor**: Shows real-time node metrics
- **Performance Dashboard**: Displays cluster performance graphs

### Available Commands

- `IoT Cluster: New Simulation` - Create a new simulation
- `IoT Cluster: Start Simulation` - Start an existing simulation
- `IoT Cluster: Stop Simulation` - Stop a running simulation
- `IoT Cluster: Configure Load Balancing` - Set up load balancing strategies
- `IoT Cluster: Monitor Cluster` - Open the monitoring dashboard

## Configuration

### Extension Settings

This extension contributes the following settings:

- `iotCluster.telemetryInterval`: Interval for telemetry updates (ms)
- `iotCluster.logLevel`: Logging level (debug, info, warn, error)
- `iotCluster.dataDirectory`: Default directory for simulation data
- `iotCluster.compressionEnabled`: Enable/disable data compression

### Load Balancing Strategies

Configure load balancing through the settings:

```json
{
  "iotCluster.loadBalancing": {
    "strategy": "round-robin",
    "checkInterval": 5000,
    "threshold": 80
  }
}
```

## API

The extension exposes the following API for other extensions to consume:

```typescript
export interface IotClusterApi {
  startSimulation(config: SimulationConfig): Promise<void>;
  stopSimulation(name: string): Promise<void>;
  getClusterMetrics(): Promise<ClusterMetrics>;
}
```

## Troubleshooting

### Common Issues

1. **Extension Not Activating**
   - Ensure you have the required VS Code version (1.85.0+)
   - Check the extension activation events in the debug console

2. **Simulation Fails to Start**
   - Verify the data directory permissions
   - Check the error log for detailed information
   - Ensure all required configuration is provided

3. **Performance Issues**
   - Reduce the telemetry update frequency
   - Check system resources usage
   - Consider enabling data compression

## Contributing

1. Clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run compile`
4. Debug: Launch the "Extension" debug configuration in VS Code

## License

This extension is licensed under the MIT License. See the LICENSE file for details.