import { 
    ClusterNodeConfig, 
    SimulationTrace, 
    HeartbeatData, 
    NodeStatus, 
    GPUInfo, 
    NetworkInfo,
    LoadBalancingStrategy,
    FailureRecoveryConfig,
    CompressionConfig,
	DiskInfo
} from '../types/cluster';
import { logger } from '../utils/logger';

export class ClusterNode {
    private traces: SimulationTrace[] = [];
    private lastHeartbeat: Date;
    private status: NodeStatus = 'offline';
    private gpus: GPUInfo[] = [];
	private disk: DiskInfo;
    private network: NetworkInfo;
    private workload: number = 0;
    private failureCount: number = 0;
    private compressionConfig: CompressionConfig = {
        enabled: false,
        algorithm: 'gzip',
        level: 6,
        threshold: 1024
    };
    private recoveryConfig: FailureRecoveryConfig = {
        maxRetries: 3,
        retryDelay: 5000,
        failureThreshold: 3,
        recoveryStrategy: 'restart'
    };

    constructor(private config: ClusterNodeConfig) {
        this.lastHeartbeat = new Date();
        this.status = config.status || 'offline';
        this.gpus = config.gpus || [];
		this.disk = config.disk || {
			label: '--',
			size: 0
		};
        this.network = config.network || {
			ip: '',
			role: '',
            bandwidth: 1000,
            latency: 1,
            packetLoss: 0,
            lastUpdate: new Date()
        };
        this.workload = config.workload || 0;
    }

    updateHeartbeat(data: HeartbeatData): void {
        this.lastHeartbeat = data.timestamp;
        this.status = data.status;
        if (data.gpus) {
            this.gpus = data.gpus;
        }
        if (data.network) {
            this.network = data.network;
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
				disk: this.disk,
                network: this.network,
                workload: this.workload
            }
        });
        logger.info('Node heartbeat updated', {
            node: this.config.name,
            status: this.status,
            workload: this.workload
        });
    }

    emitTrace(trace: Omit<SimulationTrace, 'origin'>): void {
        const fullTrace: SimulationTrace = {
            origin: this.config.name,
            ...trace
        };
        this.traces.push(fullTrace);
        logger.info('Node trace emitted', { trace: fullTrace });
    }

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
        }, this.recoveryConfig.retryDelay);
    }

    private initiateFailover(): void {
        this.status = 'offline';
        this.emitTrace({
            timestamp: new Date(),
            type: 'warning',
            message: 'Initiating failover process',
            data: { status: this.status }
        });
        // La lógica específica de failover se implementará en el orquestador
    }

    private enterDegradedMode(): void {
        this.status = 'degraded';
        this.emitTrace({
            timestamp: new Date(),
            type: 'warning',
            message: 'Entered degraded mode',
            data: { status: this.status }
        });
    }

    selectOptimalGPU(strategy: LoadBalancingStrategy = 'least-loaded'): GPUInfo | null {
        if (this.gpus.length === 0) {return null;}

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

    getWorkload(): number {
        return this.workload;
    }

    getTraces(): SimulationTrace[] {
        return this.traces;
    }

    clearTraces(): void {
        this.traces = [];
    }

    getConfig(): ClusterNodeConfig {
        return {
            ...this.config,
            gpus: this.gpus,
			disk: this.disk,
            network: this.network,
            status: this.status,
            lastHeartbeat: this.lastHeartbeat,
            workload: this.workload,
            failureCount: this.failureCount,
            compressionEnabled: this.compressionConfig.enabled
        };
    }

    getStatus(): NodeStatus {
        const now = new Date();
        const heartbeatAge = now.getTime() - this.lastHeartbeat.getTime();
        if (heartbeatAge > 30000) { // 30 segundos sin heartbeat
            this.status = 'offline';
        }
        return this.status;
    }

    getGPUInfo(): GPUInfo[] {
        return this.gpus;
    }

    getNetworkInfo(): NetworkInfo {
        return this.network;
    }

	getDiskInfo(): DiskInfo {
        return this.disk;
    }

    simulateLoad(): void {
        // Simular cambios en la carga de GPU y red
        this.gpus = this.gpus.map(gpu => ({
            ...gpu,
            utilization: Math.min(100, gpu.utilization + Math.random() * 10),
            temperature: Math.min(90, gpu.temperature + Math.random() * 5)
        }));

        this.network = {
            ...this.network,
            latency: Math.max(1, this.network.latency + (Math.random() * 2 - 1)),
            packetLoss: Math.max(0, Math.min(100, this.network.packetLoss + (Math.random() * 0.5 - 0.25))),
            lastUpdate: new Date()
        };

        // Actualizar la carga de trabajo general del nodo
        this.workload = Math.min(100, Math.max(0, 
            this.gpus.reduce((acc, gpu) => acc + gpu.utilization, 0) / this.gpus.length
        ));
    }

    setCompressionConfig(config: Partial<CompressionConfig>): void {
        this.compressionConfig = { ...this.compressionConfig, ...config };
        this.emitTrace({
            timestamp: new Date(),
            type: 'info',
            message: 'Compression configuration updated',
            data: { compression: this.compressionConfig }
        });
    }

    setRecoveryConfig(config: Partial<FailureRecoveryConfig>): void {
        this.recoveryConfig = { ...this.recoveryConfig, ...config };
        this.emitTrace({
            timestamp: new Date(),
            type: 'info',
            message: 'Recovery configuration updated',
            data: { recovery: this.recoveryConfig }
        });
    }
}