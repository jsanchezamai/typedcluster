export type WorkType = "Detector de anomalías" | "Trabajo genérico";
export type Strategy = "estadística" | "machine learning";
export type StatisticalAlgorithm = "umbrales fijos" | "desviación estándar" | "series temporales";
export type MLAlgorithm = "Redes neuronales" | "Árboles de decisión" | "Redes neuronales Recurrentes";
export type Algorithm = StatisticalAlgorithm | MLAlgorithm;
export type SimulationStatus = "stopped" | "running" | "paused";

export interface SensorRange {
    min: number;
    max: number;
}

export interface PhaseRanges {
    s1: SensorRange[];
    s2: SensorRange[];
    s3: SensorRange[];
    s4: SensorRange[];
    s5: SensorRange[];
}

export interface TelemetryData {
    timestamp: number;
    phase: number;
    values: {
        s1: number;
        s2: number;
        s3: number;
        s4: number;
        s5: number;
    };
}

export interface SimulationTrace {
    origin: string;
    simulation: {
        strategy: Strategy;
        algorithm: Algorithm;
        name: string;
    };
    verboseType: string;
    data: any;
}

export interface ClusterNodeConfig {
    name: string;
    ip: string;
    role: "orchestrator" | "data_manager" | "model_manager" | "network_manager";
}

export interface SensorData {
    timestamp: Date;
    plcId: number;
    phase: number;
    values: { [sensor: string]: number };
    anomaly: boolean;
}