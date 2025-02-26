**IoT Cluster Client v1.0.0**

***

# IoT Cluster Client

A TypeScript client library for managing nodes in an IoT cluster system. This package provides a robust foundation for building distributed IoT applications with features like automatic failure recovery, load balancing, and performance monitoring.

## Features

- 🔄 Automatic node failure recovery
- ⚖️ GPU load balancing strategies
- 📊 Performance monitoring and metrics
- 🔍 Detailed node tracing and logging
- 🗜️ Configurable data compression
- 🛡️ Flexible failure recovery strategies

## Documentation

The project uses TypeDoc for API documentation generation. Documentation is automatically generated from source code comments and can be found in the `docs` directory.

### Generating Documentation

To regenerate the documentation:

```bash
npm run docs:generate
```

This will create/update the API documentation in Markdown format in the `docs` directory.

### Documentation Structure

- `docs/classes` - Class API documentation
- `docs/interfaces` - Interface definitions
- `docs/modules` - Module documentation
- `docs/README.md` - API overview

For development-related documentation, please refer to our [Developer Guide](docs/DEVELOPER.md).

## Installation

```bash
npm install iot-cluster-client
```

## Quick Start

```typescript
import { ClusterNode, NodeConfig } from 'iot-cluster-client';

// Configure your node
const config: NodeConfig = {
    name: 'worker-1',
    ip: '192.168.1.100',
    role: 'worker',
    gpus: [
        {
            model: 'NVIDIA A100',
            memory: 80,
            utilization: 0,
            temperature: 35
        }
    ]
};

// Create a new node instance
const node = new ClusterNode(config);

// Configure failure recovery 
node.setRecoveryConfig({
    maxRetries: 3,
    retryDelay: 5000,
    failureThreshold: 3,
    recoveryStrategy: 'restart'
});

// Configure compression
node.setCompressionConfig({
    enabled: true,
    algorithm: 'gzip',
    level: 6,
    threshold: 1024
});

// Handle heartbeats
node.updateHeartbeat({
    timestamp: new Date(),
    status: 'online',
    workload: 25,
    gpus: [/* updated GPU info */]
});

// Get optimal GPU for workload
const gpu = node.selectOptimalGPU('least-loaded');
```

## API Reference

### ClusterNode

The main class for managing a node in the IoT cluster.

#### Constructor

```typescript
constructor(config: NodeConfig)
```

#### Methods

- `updateHeartbeat(data: HeartbeatData): void`
  - Updates node status with new heartbeat data

- `handleFailure(): boolean`
  - Handles node failure and triggers recovery if needed

- `selectOptimalGPU(strategy?: LoadBalancingStrategy): GPUInfo | null`
  - Selects the best GPU based on the specified strategy

- `getWorkload(): number`
  - Returns current node workload

- `getTraces(): NodeTrace[]`
  - Returns node operation traces

- `getConfig(): NodeConfig`
  - Returns current node configuration

- `setCompressionConfig(config: Partial<CompressionConfig>): void`
  - Updates compression settings

- `setRecoveryConfig(config: Partial<FailureRecoveryConfig>): void`
  - Updates failure recovery settings

## Error Handling

The library includes comprehensive error handling and logging:

```typescript
node.handleFailure(); // Returns true if recovery is initiated
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

MIT License - see LICENSE file for details
