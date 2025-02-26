import { ClusterNode, NodeConfig } from '../src';

// Create a basic node configuration
const config: NodeConfig = {
    name: 'edge-node-1',
    ip: '192.168.1.100',
    role: 'worker',
    gpus: [
        {
            model: 'NVIDIA T4',
            memory: 16,
            utilization: 0,
            temperature: 35
        }
    ]
};

// Initialize the node
const node = new ClusterNode(config);

// Configure failure recovery
node.setRecoveryConfig({
    maxRetries: 3,
    retryDelay: 5000,
    failureThreshold: 2,
    recoveryStrategy: 'restart'
});

// Configure data compression
node.setCompressionConfig({
    enabled: true,
    algorithm: 'gzip',
    level: 6,
    threshold: 1024
});

// Simulate heartbeat updates
setInterval(() => {
    node.updateHeartbeat({
        timestamp: new Date(),
        status: 'online',
        workload: Math.random() * 100,
        gpus: [
            {
                ...config.gpus![0],
                utilization: Math.random() * 100,
                temperature: 35 + Math.random() * 30
            }
        ]
    });

    // Get current node status
    const nodeStatus = node.getConfig();
    console.log('Current node status:', nodeStatus);

    // Get optimal GPU based on temperature
    const optimalGpu = node.selectOptimalGPU('temperature-aware');
    console.log('Optimal GPU for new workload:', optimalGpu);
}, 5000);

// Log all node traces
setInterval(() => {
    const traces = node.getTraces();
    console.log('Recent node traces:', traces);
    node.clearTraces(); // Clear after logging
}, 30000);
