import { Simulation } from "../models/Simulation";
import { ClusterNode } from "../models/ClusterNode";
import { FileManager } from "./FileManager";
import { TelemetryGenerator } from "./TelemetryGenerator";
import { logger } from "../utils/logger";
import {
    ClusterNodeConfig,
    GPUInfo,
    NetworkInfo,
    LoadBalancingStrategy,
    FailureRecoveryConfig,
    CompressionConfig,
	DiskInfo,
} from "../types/cluster";
import { SensorSimulator } from "./SensorSimulator";

export class SimulationManager {
    private simulations: Map<string, Simulation> = new Map();
    private nodes: Map<string, ClusterNode> = new Map();
    private fileManager: FileManager;
    private telemetryGenerator: TelemetryGenerator;
    private sensorSimulator?: SensorSimulator;
    private loadBalancingStrategy: LoadBalancingStrategy = "least-loaded";
    private loadSimulationInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.fileManager = new FileManager();
        this.telemetryGenerator = new TelemetryGenerator(this.fileManager);
        this.initialize();
    }

    private async initialize() {
        await this.loadSimulations();
        await this.loadOrInitializeClusterNodes();
    }

    private async loadOrInitializeClusterNodes() {
        const loadedNodes = await this.fileManager.loadNodes();
        if (loadedNodes.size > 0) {
            this.nodes = loadedNodes;
            logger.info("Loaded existing cluster nodes configuration");
        } else {
            this.initializeDefaultNodes();
            await this.fileManager.saveNodes(this.nodes);
            logger.info("Initialized default cluster nodes configuration");
        }
    }

    private initializeDefaultNodes() {
        const defaultNodes: ClusterNodeConfig[] = [
            {
                name: "RPi 5",
                gpus: [],
				disk: {
					label: "NVMe|SDCard",
					size: 64
                },
                network: {
					ip: "192.168.1.99",
					role: "router",
                    bandwidth: 1,
                    latency: 1,
                    packetLoss: 0,
                    lastUpdate: new Date(),
                },
                status: "online",
                lastHeartbeat: new Date(),
                workload: 0,
                failureCount: 0,
                compressionEnabled: false,
            },
            {
                name: "AGX Orin",
                gpus: [
                    {
                        model: "2048 Ampere",
                        memory: 64,
                        utilization: 0,
                        temperature: 35,
						tops: 275,
						tensorCores: 64
                    },
                ],
                network: {
					ip: "192.168.1.100",
					role: "node-sun",
                    bandwidth: 10,
                    latency: 1,
                    packetLoss: 0,
                    lastUpdate: new Date(),
                },
				disk: {
					label: "eMMC 5.1",
					size: 64
                },
                status: "online",
                lastHeartbeat: new Date(),
                workload: 0,
                failureCount: 0,
                compressionEnabled: false,
            },
            {
                name: "J202 NX (Yang)",
                gpus: [
                    {
                        model: "1024 Ampere",
                        memory: 16,
                        utilization: 0,
                        temperature: 35,
						tops: 157,
						tensorCores: 32
                    },
                ],
				disk: {
					label: "NVMe|SDCard",
					size: 64
                },
                network: {
					ip: "192.168.1.101",
					role: "node-white",
                    bandwidth: 1,
                    latency: 1,
                    packetLoss: 0,
                    lastUpdate: new Date(),
                },
                status: "online",
                lastHeartbeat: new Date(),
                workload: 0,
                failureCount: 0,
                compressionEnabled: false,
            },
            {
                name: "J202 NX (Yin)",
                gpus: [
                    {
                        model: "1024 Ampere",
                        memory: 16,
                        utilization: 0,
                        temperature: 35,
						tops: 157,
						tensorCores: 32
                    },
                ],
				disk: {
					label: "NVMe|SDCard",
					size: 64
                },
                network: {
					ip: "192.168.1.102",
					role: "node-black",
                    bandwidth: 1,
                    latency: 1,
                    packetLoss: 0,
                    lastUpdate: new Date(),
                },
                status: "online",
                lastHeartbeat: new Date(),
                workload: 0,
                failureCount: 0,
                compressionEnabled: false,
            },
            {
                name: "Orin Nano",
                network: {
					ip: "192.168.1.103",
					role: "node-tiny",
                    bandwidth: 1,
                    latency: 1,
                    packetLoss: 0,
                    lastUpdate: new Date(),
                },
				disk: {
					label: "NVMe|SDCard",
					size: 64
                },
                status: "online",
                gpus: [
                    {
                        model: "1024 Ampere",
                        memory: 8,
                        utilization: 0,
                        temperature: 35,
						tops: 67,
						tensorCores: 32
                    },
                ],

                workload: 0,
                failureCount: 0,
                compressionEnabled: false,
            },
        ];

        defaultNodes.forEach((config) => {
            this.nodes.set(config.name, new ClusterNode(config));
        });
    }

    private async loadSimulations() {
        const savedSimulations = await this.fileManager.loadSimulations();
        savedSimulations.forEach((sim) => {
            this.simulations.set(sim.name, sim);
        });
    }

    async addSimulation(simulation: Simulation): Promise<void> {
        if (this.simulations.has(simulation.name)) {
            throw new Error("Simulation with this name already exists");
        }
        this.simulations.set(simulation.name, simulation);
        await this.fileManager.saveSimulations(
            Array.from(this.simulations.values())
        );
        logger.info("Simulation added", { simulation: simulation.name });
    }

    async removeSimulation(name: string): Promise<void> {
        if (!this.simulations.has(name)) {
            throw new Error("Simulation not found");
        }
        this.simulations.delete(name);
        await this.fileManager.saveSimulations(
            Array.from(this.simulations.values())
        );
        logger.info("Simulation removed", { simulation: name });
    }

    getSimulations(): Simulation[] {
        return Array.from(this.simulations.values());
    }

    getRunningSimulations(): Simulation[] {
        return this.getSimulations().filter((sim) => sim.status === "running");
    }

    async generateHistoricalData(
        simulationName: string,
        startDate: Date,
        endDate: Date,
        anomalyFactor: number
    ): Promise<void> {
        const simulation = this.simulations.get(simulationName);
        if (!simulation) {
            throw new Error("Simulation not found");
        }

        logger.info("Starting historical data generation", {
            simulation: simulationName,
            startDate,
            endDate,
            anomalyFactor,
        });

        await this.telemetryGenerator.generateHistoricalData(
            simulation,
            startDate,
            endDate,
            anomalyFactor
        );
    }

    async startSimulation(name: string): Promise<void> {
        const simulation = this.simulations.get(name);
        if (!simulation) {
            throw new Error("Simulation not found");
        }
        simulation.status = "running";
        simulation.lastUpdate = new Date();
        await this.fileManager.saveSimulations(
            Array.from(this.simulations.values())
        );

        this.telemetryGenerator.startGeneration(simulation);
        logger.info("Simulation started", { simulation: name });
    }

    async stopSimulation(name: string): Promise<void> {
        const simulation = this.simulations.get(name);
        if (!simulation) {
            throw new Error("Simulation not found");
        }
        simulation.status = "stopped";
        simulation.lastUpdate = new Date();
        await this.fileManager.saveSimulations(
            Array.from(this.simulations.values())
        );

        this.telemetryGenerator.stopGeneration(simulation);
        logger.info("Simulation stopped", { simulation: name });
    }

    async pauseSimulation(name: string): Promise<void> {
        const simulation = this.simulations.get(name);
        if (!simulation) {
            throw new Error("Simulation not found");
        }
        simulation.status = "paused";
        simulation.lastUpdate = new Date();
        await this.fileManager.saveSimulations(
            Array.from(this.simulations.values())
        );

        this.telemetryGenerator.pauseGeneration(simulation);
        logger.info("Simulation paused", { simulation: name });
    }

    async startHistoricalSensorSimulation(
        plcCount: number,
        temperature: number,
        startDate: Date,
        endDate: Date
    ): Promise<void> {
        if (this.sensorSimulator) {
            throw new Error("A sensor simulation is already running");
        }

        this.sensorSimulator = new SensorSimulator(
            plcCount,
            temperature,
            startDate,
            this.fileManager,
            endDate
        );

        logger.info("Starting historical sensor simulation", {
            plcCount,
            temperature,
            startDate,
            endDate,
        });

        await this.sensorSimulator.generateHistoricalData();
    }

    async startRealtimeSensorSimulation(
        plcCount: number,
        temperature: number,
        brokerUrl: string
    ): Promise<void> {
        if (this.sensorSimulator) {
            throw new Error("A sensor simulation is already running");
        }

        this.sensorSimulator = new SensorSimulator(
            plcCount,
            temperature,
            new Date(),
            this.fileManager
        );

        logger.info("Starting realtime sensor simulation", {
            plcCount,
            temperature,
            brokerUrl,
        });

        await this.sensorSimulator.startRealTimeSimulation(brokerUrl);
    }

    async stopSensorSimulation(): Promise<void> {
        if (!this.sensorSimulator) {
            throw new Error("No sensor simulation is running");
        }

        this.sensorSimulator.stopRealTimeSimulation();
        this.sensorSimulator = undefined;
        logger.info("Stopped sensor simulation");
    }

    setLoadBalancingStrategy(strategy: LoadBalancingStrategy): void {
        this.loadBalancingStrategy = strategy;
        logger.info("Load balancing strategy updated", { strategy });
    }

    setFailureRecoveryConfig(config: FailureRecoveryConfig): void {
        for (const node of this.nodes.values()) {
            node.setRecoveryConfig(config);
        }
        logger.info("Failure recovery configuration updated", { config });
    }

    setCompressionConfig(config: CompressionConfig): void {
        for (const node of this.nodes.values()) {
            node.setCompressionConfig(config);
        }
        logger.info("Compression configuration updated", { config });
    }

    getClusterStatus(): {
        nodes: Map<
            string,
            {
                status: string;
                gpus: GPUInfo[];
				disk: DiskInfo;
                network: NetworkInfo;
                workload: number;
            }
        >;
        totalGpus: number;
        averageWorkload: number;
        activeNodes: number;
    } {
        const status = {
            nodes: new Map(),
            totalGpus: 0,
            averageWorkload: 0,
            activeNodes: 0,
        };

        let totalWorkload = 0;

        for (const [name, node] of this.nodes.entries()) {
            const nodeStatus = {
                status: node.getStatus(),
                gpus: node.getGPUInfo(),
				disk: node.getDiskInfo(),
                network: node.getNetworkInfo(),
                workload: node.getWorkload(),
            };

            status.nodes.set(name, nodeStatus);
            status.totalGpus += nodeStatus.gpus.length;
            totalWorkload += nodeStatus.workload;

            if (nodeStatus.status === "online") {
                status.activeNodes++;
            }
        }

        status.averageWorkload =
            status.activeNodes > 0 ? totalWorkload / status.activeNodes : 0;

        return status;
    }

    getOptimalGPU(): { node: ClusterNode; gpu: GPUInfo } | null {
        let selectedNode: ClusterNode | null = null;
        let selectedGPU: GPUInfo | null = null;
        let bestMetric = Infinity;

        for (const node of this.nodes.values()) {
            if (node.getStatus() !== "online") {
                continue;
            }

            const gpu = node.selectOptimalGPU(this.loadBalancingStrategy);
            if (!gpu) {
                continue;
            }

            const metric = this.calculateMetric(node, gpu);
            if (metric < bestMetric) {
                bestMetric = metric;
                selectedNode = node;
                selectedGPU = gpu;
            }
        }

        return selectedNode && selectedGPU
            ? { node: selectedNode, gpu: selectedGPU }
            : null;
    }

    private calculateMetric(node: ClusterNode, gpu: GPUInfo): number {
        switch (this.loadBalancingStrategy) {
            case "least-loaded":
                return gpu.utilization + node.getWorkload() * 0.5; // Consider both GPU and node workload
            case "temperature-aware":
                return gpu.temperature + node.getWorkload() * 0.2; // Weight temperature more heavily
            case "round-robin":
                // Use node's last update time to ensure fair distribution
                return node.getNetworkInfo().lastUpdate.getTime();
            default:
                return gpu.utilization;
        }
    }

    simulateClusterLoad(): void {
        for (const node of this.nodes.values()) {
            node.simulateLoad();
        }
        logger.debug("Cluster load simulation completed");
    }

    startClusterSimulation(): void {
        if (this.loadSimulationInterval) {
            logger.warn("Cluster simulation already running");
            return;
        }

        this.loadSimulationInterval = setInterval(() => {
            // this.simulateClusterLoad();
            logger.debug("Cluster load simulation updated");
        }, 5000); // Actualizar cada 5 segundos

        logger.info("Started cluster load simulation");
    }

    stopClusterSimulation(): void {
        if (this.loadSimulationInterval) {
            clearInterval(this.loadSimulationInterval);
            this.loadSimulationInterval = null;
            logger.info("Stopped cluster load simulation");
        }
    }
    getNodeConfig(nodeName: string): ClusterNodeConfig | undefined {
        const node = this.nodes.get(nodeName);
        return node ? node.getConfig() : undefined;
    }
}
