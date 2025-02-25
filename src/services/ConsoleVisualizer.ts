import { SensorData } from '../types';
import { logger } from '../utils/logger';

export class ConsoleVisualizer {
    private static instance: ConsoleVisualizer;
    private lastUpdate: Date = new Date();
    private updateInterval: NodeJS.Timeout | null = null;
    private data: Map<number, SensorData> = new Map();

    private constructor() {}

    static getInstance(): ConsoleVisualizer {
        if (!ConsoleVisualizer.instance) {
            ConsoleVisualizer.instance = new ConsoleVisualizer();
        }
        return ConsoleVisualizer.instance;
    }

    start(): void {
        if (this.updateInterval) {
            return;
        }

        // Clear console and set up display
        console.clear();
        this.updateInterval = setInterval(() => {
            this.render();
        }, 1000);

        logger.info('Console visualizer started');
    }

    stop(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.data.clear();
        console.clear();
        logger.info('Console visualizer stopped');
    }

    updateData(sensorData: SensorData): void {
        this.data.set(sensorData.plcId, sensorData);
        this.lastUpdate = new Date();
    }

    private render(): void {
        console.clear();
        console.log('\x1b[1m=== Sensor Data Visualization ===\x1b[0m');
        console.log(`Last Update: ${this.lastUpdate.toLocaleTimeString()}\n`);

        if (this.data.size === 0) {
            console.log('Waiting for data...');
            return;
        }

        // Sort PLCs by ID for consistent display
        const sortedPLCs = Array.from(this.data.entries()).sort(([a], [b]) => a - b);

        for (const [plcId, data] of sortedPLCs) {
            const anomalyIndicator = data.anomaly ? '\x1b[31m⚠\x1b[0m' : ' ';
            console.log(`\x1b[1mPLC ${plcId} ${anomalyIndicator}\x1b[0m`);
            console.log(`Phase: ${data.phase}`);

            // Display sensor values with color coding
            Object.entries(data.values).forEach(([sensor, value]) => {
                const numericValue = value as number;
                const color = this.getValueColor(numericValue);
                console.log(`  ${sensor}: ${color}${numericValue.toFixed(2)}\x1b[0m`);
            });
            console.log(''); // Empty line between PLCs
        }
    }

    private getValueColor(value: number): string {
        if (value > 30) {return '\x1b[31m';} // Red for high values
        if (value > 15) {return '\x1b[33m';} // Yellow for medium values
        return '\x1b[32m'; // Green for low values
    }
}