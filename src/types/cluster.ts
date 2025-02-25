export type GPUInfo = {
    model: string;
    memory: number; // en GB
    utilization: number; // porcentaje
    temperature: number; // en Celsius
};

export type NetworkInfo = {
    bandwidth: number; // en Mbps
    latency: number; // en ms
    packetLoss: number; // porcentaje
    lastUpdate: Date;
};

export type NodeStatus = 'online' | 'offline' | 'degraded';

export type ClusterNodeConfig = {
    name: string;
    ip: string;
    role: 'orchestrator' | 'data_manager' | 'model_manager' | 'network_manager';
    gpus?: GPUInfo[];
    network?: NetworkInfo;
    status?: NodeStatus;
    lastHeartbeat?: Date;
    workload?: number; // Porcentaje de carga de trabajo actual
    failureCount?: number; // Número de fallos detectados
    compressionEnabled?: boolean; // Indica si la compresión está habilitada
};

export type HeartbeatData = {
    timestamp: Date;
    status: NodeStatus;
    gpus?: GPUInfo[];
    network?: NetworkInfo;
    workload?: number;
};

export type SimulationTrace = {
    timestamp: Date;
    type: 'info' | 'warning' | 'error';
    message: string;
    origin?: string;
    data?: any;
};

export type LoadBalancingStrategy = 'round-robin' | 'least-loaded' | 'temperature-aware';

export type FailureRecoveryConfig = {
    maxRetries: number;
    retryDelay: number; // en ms
    failureThreshold: number;
    recoveryStrategy: 'restart' | 'failover' | 'degraded';
};

export type CompressionConfig = {
    enabled: boolean;
    algorithm: 'gzip' | 'lz4' | 'none';
    level: number; // 1-9 para gzip, 1-16 para lz4
    threshold: number; // Tamaño mínimo para comprimir (en bytes)
};