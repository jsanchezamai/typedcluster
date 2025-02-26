export type GPUInfo = {
    model: string;
    memory: number; // in GB
    utilization: number; // percentage
    temperature: number; // in Celsius
};

export type NetworkInfo = {
    bandwidth: number; // in Mbps
    latency: number; // in ms
    packetLoss: number; // percentage
    lastUpdate: Date;
};

export type NodeStatus = 'online' | 'offline' | 'degraded';

export type NodeConfig = {
    name: string;
    ip: string;
    role: 'worker' | 'manager';
    gpus?: GPUInfo[];
    network?: NetworkInfo;
    status?: NodeStatus;
    lastHeartbeat?: Date;
    workload?: number;
    failureCount?: number;
    compressionEnabled?: boolean;
};

export type HeartbeatData = {
    timestamp: Date;
    status: NodeStatus;
    gpus?: GPUInfo[];
    network?: NetworkInfo;
    workload?: number;
};

export type NodeTrace = {
    timestamp: Date;
    type: 'info' | 'warning' | 'error';
    message: string;
    origin?: string;
    data?: any;
};

export type LoadBalancingStrategy = 'round-robin' | 'least-loaded' | 'temperature-aware';

export type FailureRecoveryConfig = {
    maxRetries: number;
    retryDelay: number; // in ms
    failureThreshold: number;
    recoveryStrategy: 'restart' | 'failover' | 'degraded';
};

export type CompressionConfig = {
    enabled: boolean;
    algorithm: 'gzip' | 'lz4' | 'none';
    level: number; // 1-9 for gzip, 1-16 for lz4
    threshold: number; // Minimum size to compress (in bytes)
};
