/// <reference types="jest" />
import { ClusterNode, NodeConfig, GPUInfo } from '..';

describe('ClusterNode', () => {
    let node: ClusterNode;
    const defaultConfig: NodeConfig = {
        name: 'test-node',
        ip: '192.168.1.100',
        role: 'worker',
        gpus: [
            {
                model: 'NVIDIA A100',
                memory: 80,
                utilization: 30,
                temperature: 45
            },
            {
                model: 'NVIDIA A100',
                memory: 80,
                utilization: 60,
                temperature: 65
            }
        ]
    };

    beforeEach(() => {
        node = new ClusterNode(defaultConfig);
    });

    describe('Initialization', () => {
        it('should initialize with correct config', () => {
            const config = node.getConfig();
            expect(config.name).toBe('test-node');
            expect(config.ip).toBe('192.168.1.100');
            expect(config.role).toBe('worker');
            expect(config.gpus).toHaveLength(2);
        });
    });

    describe('Heartbeat Handling', () => {
        it('should update status on heartbeat', () => {
            const heartbeat = {
                timestamp: new Date(),
                status: 'online' as const,
                workload: 45,
                gpus: defaultConfig.gpus
            };

            node.updateHeartbeat(heartbeat);
            const config = node.getConfig();
            expect(config.status).toBe('online');
            expect(config.workload).toBe(45);
        });
    });

    describe('GPU Selection', () => {
        it('should select least loaded GPU', () => {
            const gpu = node.selectOptimalGPU('least-loaded');
            expect(gpu).toBeDefined();
            expect(gpu?.utilization).toBe(30);
        });

        it('should select coolest GPU for temperature-aware strategy', () => {
            const gpu = node.selectOptimalGPU('temperature-aware');
            expect(gpu).toBeDefined();
            expect(gpu?.temperature).toBe(45);
        });
    });

    describe('Failure Recovery', () => {
        it('should handle failures and trigger recovery', () => {
            node.setRecoveryConfig({
                maxRetries: 2,
                retryDelay: 100,
                failureThreshold: 2,
                recoveryStrategy: 'restart'
            });

            // Simulate failures
            node.handleFailure();
            const firstStatus = node.getConfig().status;
            expect(firstStatus).toBe('offline');

            node.handleFailure();
            const traces = node.getTraces();
            expect(traces.some(t => t.message.includes('recovery'))).toBeTruthy();
        });
    });

    describe('Compression Configuration', () => {
        it('should apply compression settings', () => {
            const compressionConfig = {
                enabled: true,
                algorithm: 'gzip' as const,
                level: 6,
                threshold: 1024
            };

            node.setCompressionConfig(compressionConfig);
            const traces = node.getTraces();
            expect(traces.some(t => t.message.includes('Compression configuration updated'))).toBeTruthy();
        });
    });
});