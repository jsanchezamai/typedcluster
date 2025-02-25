import { NodeStatus, GPUInfo, NetworkInfo } from '../../types/cluster';
import { Simulation } from '../../models/Simulation';

// Mock simulation for testing
export const mockSimulation = new Simulation(
    "Anomaly Detection Cluster",
    "Neural network-based anomaly detection on IoT sensor data",
    5, // Total nodes (4 Jetson + 1 RPi)
    "Detector de anomalías",
    "machine learning",
    "Redes neuronales",
    "./data/anomaly_detection"
);

// Mock cluster node data
export const mockClusterNodes = new Map<string, {
    status: NodeStatus,
    gpus: GPUInfo[],
    network: NetworkInfo,
    workload: number
}>();

// RPi master node
mockClusterNodes.set("rpi-master", {
    status: "online",
    gpus: [],
    network: {
        bandwidth: 1000,
        latency: 2,
        packetLoss: 0.1,
        lastUpdate: new Date()
    },
    workload: 45
});

// Jetson nodes
for (let i = 1; i <= 4; i++) {
    mockClusterNodes.set(`jetson-${i}`, {
        status: "online",
        gpus: [{
            model: "NVIDIA Xavier NX",
            utilization: 75 + Math.random() * 15,
            temperature: 65 + Math.random() * 10,
            memory: 8 // Total memory in GB
        }],
        network: {
            bandwidth: 1000,
            latency: 1 + Math.random(),
            packetLoss: Math.random() * 0.2,
            lastUpdate: new Date()
        },
        workload: 70 + Math.random() * 20
    });
}