/**
 * @packageDocumentation
 * Core implementation of an IoT cluster node with MQTT communication, failure recovery, and workload management.
 */

import { createLogger, format, transports } from 'winston';
import * as mqtt from 'mqtt';
import {
    NodeConfig,
    HeartbeatData,
    NodeTrace,
    GPUInfo,
    LoadBalancingStrategy,
    FailureRecoveryConfig,
    CompressionConfig
} from './types';

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'cluster-node.log' })
    ]
});

/**
 * Interface defining the structure of command messages received via MQTT
 * @public
 */
interface CommandMessage {
    type: 'updateConfig' | 'requestStatus';
    data: {
        compression?: Partial<CompressionConfig>;
        recovery?: Partial<FailureRecoveryConfig>;
    };
}

/**
 * Represents a node in an IoT cluster with capabilities for GPU management,
 * failure recovery, and MQTT-based communication.
 * 
 * @example
 * ```typescript
 * const node = new ClusterNode({
 *   name: 'worker-1',
 *   ip: '192.168.1.100',
 *   role: 'worker',
 *   gpus: [{
 *     model: 'NVIDIA A100',
 *     memory: 80,
 *     utilization: 0,
 *     temperature: 35
 *   }]
 * });
 * ```
 */
export class ClusterNode {
    private traces: NodeTrace[] = [];
    private status: 'online' | 'offline' | 'degraded' = 'offline';
    private gpus: GPUInfo[] = [];
    private workload = 0;
    private failureCount = 0;
    private lastHeartbeat: Date;
    private mqttClient: mqtt.MqttClient | null = null;
    private readonly mqttTopic: string;

    /** Configuration for data compression */
    private compressionConfig: CompressionConfig = {
        enabled: false,
        algorithm: 'gzip',
        level: 6,
        threshold: 1024
    };

    /** Configuration for failure recovery behavior */
    private recoveryConfig: FailureRecoveryConfig = {
        maxRetries: 3,
        retryDelay: 5000,
        failureThreshold: 3,
        recoveryStrategy: 'restart'
    };

    /**
     * Creates a new cluster node instance
     * @param config - Configuration object for the node
     */
    constructor(private config: NodeConfig) {
        this.lastHeartbeat = new Date();
        this.status = config.status || 'offline';
        this.gpus = config.gpus || [];
        this.mqttTopic = `iot-cluster/${config.name}`;
        this.initializeMQTT();
    }

    /**
     * Initializes MQTT connection and sets up message handlers
     * @internal
     */
    private initializeMQTT(): void {
        const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

        this.mqttClient = mqtt.connect(brokerUrl, {
            clientId: `node-${this.config.name}-${Date.now()}`,
            clean: true,
            reconnectPeriod: 5000
        });

        this.mqttClient.on('connect', () => {
            logger.info('Connected to MQTT broker', {
                node: this.config.name,
                broker: brokerUrl
            });

            this.mqttClient?.subscribe(`${this.mqttTopic}/command`, (error: Error | null) => {
                if (error) {
                    logger.error('Failed to subscribe to command topic', { error });
                }
            });
        });

        this.setupMessageHandlers();
    }

    /**
     * Sets up MQTT message and error handlers
     * @internal
     */
    private setupMessageHandlers(): void {
        if (!this.mqttClient) return;

        this.mqttClient.on('message', (topic: string, message: Buffer) => {
            try {
                const command = JSON.parse(message.toString()) as CommandMessage;
                this.handleCommand(command);
            } catch (error) {
                logger.error('Failed to handle MQTT message', { error });
            }
        });

        this.mqttClient.on('error', (error: Error) => {
            logger.error('MQTT client error', { error });
        });
    }

    /**
     * Handles incoming MQTT command messages
     * @param command - The command message to process
     * @internal
     */
    private handleCommand(command: CommandMessage): void {
        logger.info('Received command', { command });
        switch (command.type) {
            case 'updateConfig':
                if (command.data.compression) {
                    this.setCompressionConfig(command.data.compression);
                }
                if (command.data.recovery) {
                    this.setRecoveryConfig(command.data.recovery);
                }
                break;
            case 'requestStatus':
                this.publishStatus();
                break;
            default:
                logger.warn('Unknown command type', { command });
        }
    }

    /**
     * Publishes current node status via MQTT
     * @internal
     */
    private publishStatus(): void {
        if (!this.mqttClient?.connected) return;

        const status = {
            name: this.config.name,
            status: this.status,
            workload: this.workload,
            gpus: this.gpus,
            lastHeartbeat: this.lastHeartbeat,
            failureCount: this.failureCount
        };

        this.mqttClient.publish(
            `${this.mqttTopic}/status`,
            JSON.stringify(status),
            { qos: 1 }
        );
    }

    /**
     * Updates the node's heartbeat information
     * @param data - New heartbeat data
     */
    updateHeartbeat(data: HeartbeatData): void {
        this.lastHeartbeat = data.timestamp;
        this.status = data.status;

        if (data.gpus) {
            this.gpus = data.gpus;
        }

        if (data.workload !== undefined) {
            this.workload = data.workload;
        }

        this.emitTrace({
            timestamp: new Date(),
            type: 'info',
            message: 'Heartbeat received',
            data: {
                status: this.status,
                gpus: this.gpus,
                workload: this.workload
            }
        });

        this.publishStatus();
    }

    /**
     * Emits a trace event for monitoring and debugging
     * @param trace - Trace information to emit
     * @internal
     */
    private emitTrace(trace: NodeTrace): void {
        const fullTrace = {
            origin: this.config.name,
            ...trace
        };
        this.traces.push(fullTrace);
        logger.info('Node trace emitted', { trace: fullTrace });

        if (this.mqttClient?.connected) {
            this.mqttClient.publish(
                `${this.mqttTopic}/trace`,
                JSON.stringify(fullTrace),
                { qos: 1 }
            );
        }
    }

    /**
     * Handles node failure events and initiates recovery if needed
     * @returns boolean indicating if recovery was initiated
     */
    handleFailure(): boolean {
        this.failureCount++;
        const shouldRecover = this.failureCount >= this.recoveryConfig.failureThreshold;

        if (shouldRecover) {
            this.emitTrace({
                timestamp: new Date(),
                type: 'warning',
                message: `Node failure detected. Initiating recovery (attempt ${this.failureCount})`,
                data: { failureCount: this.failureCount }
            });

            switch (this.recoveryConfig.recoveryStrategy) {
                case 'restart':
                    this.restart();
                    break;
                case 'failover':
                    this.initiateFailover();
                    break;
                case 'degraded':
                    this.enterDegradedMode();
                    break;
            }
        }

        return shouldRecover;
    }

    /**
     * Restarts the node after a failure
     * @internal
     */
    private restart(): void {
        this.status = 'offline';
        setTimeout(() => {
            this.status = 'online';
            this.failureCount = 0;
            this.emitTrace({
                timestamp: new Date(),
                type: 'info',
                message: 'Node restarted successfully',
                data: { status: this.status }
            });
            this.publishStatus();
        }, this.recoveryConfig.retryDelay);
    }

    /**
     * Initiates failover process for the node
     * @internal
     */
    private initiateFailover(): void {
        this.status = 'offline';
        this.emitTrace({
            timestamp: new Date(),
            type: 'warning',
            message: 'Initiating failover process',
            data: { status: this.status }
        });
        this.publishStatus();
    }

    /**
     * Switches the node to degraded mode
     * @internal
     */
    private enterDegradedMode(): void {
        this.status = 'degraded';
        this.emitTrace({
            timestamp: new Date(),
            type: 'warning',
            message: 'Entered degraded mode',
            data: { status: this.status }
        });
        this.publishStatus();
    }

    /**
     * Selects the optimal GPU based on the specified strategy
     * @param strategy - Load balancing strategy to use
     * @returns The selected GPU or null if none available
     */
    selectOptimalGPU(strategy: LoadBalancingStrategy = 'least-loaded'): GPUInfo | null {
        if (this.gpus.length === 0) return null;

        switch (strategy) {
            case 'round-robin':
                return this.gpus[Math.floor(Math.random() * this.gpus.length)];
            case 'least-loaded':
                return this.gpus.reduce((prev, current) =>
                    current.utilization < prev.utilization ? current : prev
                );
            case 'temperature-aware':
                return this.gpus.reduce((prev, current) =>
                    current.temperature < prev.temperature ? current : prev
                );
            default:
                return this.gpus[0];
        }
    }

    /**
     * Gets the current workload of the node
     * @returns Current workload percentage
     */
    getWorkload(): number {
        return this.workload;
    }

    /**
     * Gets the trace history of the node
     * @returns Array of trace events
     */
    getTraces(): NodeTrace[] {
        return this.traces;
    }

    /**
     * Clears the trace history
     */
    clearTraces(): void {
        this.traces = [];
    }

    /**
     * Gets the current configuration of the node
     * @returns Combined configuration and status information
     */
    getConfig(): NodeConfig & {
        compressionEnabled: boolean;
        lastHeartbeat: Date;
    } {
        return {
            ...this.config,
            gpus: this.gpus,
            status: this.status,
            lastHeartbeat: this.lastHeartbeat,
            workload: this.workload,
            failureCount: this.failureCount,
            compressionEnabled: this.compressionConfig.enabled
        };
    }

    /**
     * Updates the compression configuration
     * @param config - New compression settings
     */
    setCompressionConfig(config: Partial<CompressionConfig>): void {
        this.compressionConfig = { ...this.compressionConfig, ...config };
        this.emitTrace({
            timestamp: new Date(),
            type: 'info',
            message: 'Compression configuration updated',
            data: { compression: this.compressionConfig }
        });
    }

    /**
     * Updates the failure recovery configuration
     * @param config - New recovery settings
     */
    setRecoveryConfig(config: Partial<FailureRecoveryConfig>): void {
        this.recoveryConfig = { ...this.recoveryConfig, ...config };
        this.emitTrace({
            timestamp: new Date(),
            type: 'info',
            message: 'Recovery configuration updated',
            data: { recovery: this.recoveryConfig }
        });
    }

    /**
     * Disconnects from the MQTT broker and cleans up resources
     */
    disconnect(): void {
        if (this.mqttClient) {
            this.mqttClient.end();
            this.mqttClient = null;
        }
    }
}