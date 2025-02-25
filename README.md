# IoT Cluster Simulator VS Code Extension

## Overview
The IoT Cluster Simulator Extension brings powerful industrial IoT cluster simulation capabilities directly into Visual Studio Code. This extension allows developers and system architects to simulate, monitor, and analyze IoT cluster operations without leaving their development environment.

## Features
- 🖥️ **Cluster Management**: Configure and monitor virtual IoT cluster nodes
  - Real-time node status monitoring
  - GPU utilization and temperature tracking
  - Network metrics visualization
- 📊 **Load Balancing**: Test different strategies
  - Round Robin distribution
  - Least-loaded node allocation
  - Temperature-aware routing
- 🛠️ **Failure Recovery**: Simulate and handle node failures
  - Configurable retry attempts
  - Multiple recovery strategies
  - Automatic failover options
- 📈 **Historical Data**: Generate and analyze performance data
  - Custom date range selection
  - Anomaly factor configuration
  - Detailed metrics collection
- 🔌 **Sensor Simulation**: Simulate PLC sensor data
  - Real-time mode with MQTT integration
  - Historical data generation
  - Configurable anomaly injection

## Project Structure
This repository contains two independent packages:

1. **VS Code Extension (Main Package)**
   - Location: `/`
   - Documentation: `/docs/api`
   - Generate docs: `npm run docs:generate`

2. **IoT Cluster Client**
   - Location: `/iot-cluster-client`
   - Documentation: `/iot-cluster-client/docs`
   - Generate docs: `cd iot-cluster-client && npm run docs:generate`

## Requirements
- Visual Studio Code 1.85.0 or higher
- Node.js 18.x or higher

## Installation
1. Open Visual Studio Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "IoT Cluster Simulator"
4. Click Install

## Getting Started
1. Open the Command Palette (Ctrl+Shift+P)
2. Type "IoT Simulator" to see available commands
3. Start with "IoT Simulator: Create New Simulation" to set up your first simulation

## Commands
- `IoT Simulator: Create New Simulation`: Create a new cluster simulation
- `IoT Simulator: Show Cluster Status`: Open the cluster monitoring panel
- `IoT Simulator: Configure Load Balancing`: Set up load balancing strategy
- `IoT Simulator: Start Sensor Simulation`: Begin sensor data simulation
- `IoT Simulator: Generate Historical Data`: Create historical simulation data

## Views
- **Simulations**: Tree view of all configured simulations
  - View simulation details
  - Monitor simulation status
  - Control simulation execution
- **Cluster Nodes**: Monitor active cluster nodes
  - Real-time status updates
  - GPU metrics visualization
  - Network performance data

## Configuration
Access extension settings through:
1. Command Palette → "Preferences: Open Settings (UI)"
2. Search for "IoT Simulator"

Available settings:
- `iotSimulator.defaultNodeCount`: Default number of nodes for new simulations
- `iotSimulator.refreshInterval`: Metrics refresh interval (ms)
- `iotSimulator.mqttBroker`: Default MQTT broker URL

## Documentation
Both packages use TypeDoc for API documentation generation:

### VS Code Extension
```bash
# Generate VS Code extension documentation
npm run docs:generate
```
Documentation will be available in `/docs/api`

### IoT Cluster Client
```bash
# Generate client library documentation
cd iot-cluster-client
npm run docs:generate
```
Documentation will be available in `/iot-cluster-client/docs`

## Troubleshooting
See our [troubleshooting guide](docs/troubleshooting.md) for common issues and solutions.

## Contributing
We welcome contributions! Please see our [contributing guidelines](docs/CONTRIBUTING.md).

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.