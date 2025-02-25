import { connect, MqttClient } from 'mqtt';
import { SENSOR_RANGES } from '../types/sensor';
import { SensorData } from '../types';
import { FileManager } from './FileManager';
import { logger } from '../utils/logger';
import { ConsoleVisualizer } from './ConsoleVisualizer';

export class SensorSimulator {
    private temperatureFactor: number;
    private mqttClient?: MqttClient;
    private isRunning: boolean = false;
    private simulationInterval?: NodeJS.Timeout;
    private visualizer: ConsoleVisualizer;

    constructor(
        private plcCount: number,
        temperature: number,
        private startDate: Date,
        private fileManager: FileManager,
        private endDate?: Date
    ) {
        this.temperatureFactor = Math.min(Math.max(temperature, 0), 1);
        this.visualizer = ConsoleVisualizer.getInstance();
        logger.info('Sensor simulator initialized', {
            plcCount,
            temperature,
            startDate,
            endDate
        });
    }

    // Modo histórico
    public async generateHistoricalData(): Promise<SensorData[]> {
        const dataset: SensorData[] = [];
        const currentDate = new Date(this.startDate);
        this.visualizer.start();

        logger.info('Starting historical data generation', {
            startDate: this.startDate,
            endDate: this.endDate,
            plcCount: this.plcCount,
            temperatureFactor: this.temperatureFactor
        });

        let recordCount = 0;
        while (!this.endDate || currentDate <= this.endDate) {
            for (let plcId = 0; plcId < this.plcCount; plcId++) {
                const phase = this.getCurrentPhase(currentDate);
                const isAnomaly = Math.random() < this.temperatureFactor * 0.1;

                const data: SensorData = {
                    timestamp: new Date(currentDate),
                    plcId,
                    phase,
                    values: this.generateSensorValues(phase, isAnomaly),
                    anomaly: isAnomaly
                };

                dataset.push(data);
                this.visualizer.updateData(data);
                recordCount++;

                logger.debug('Generated historical record', {
                    plcId,
                    phase,
                    isAnomaly,
                    timestamp: data.timestamp
                });
            }
            currentDate.setSeconds(currentDate.getSeconds() + 30);

            if (recordCount % 100 === 0) {
                logger.debug('Historical data generation progress', {
                    recordsGenerated: recordCount,
                    currentDate,
                    recordsRemaining: this.endDate ?
                        Math.floor((this.endDate.getTime() - currentDate.getTime()) / 30000) * this.plcCount :
                        'unlimited'
                });
            }

            // Add a small delay to make the visualization readable
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.visualizer.stop();
        logger.info('Historical data generation completed', {
            totalRecords: dataset.length,
            fileName: 'historical_data.json'
        });

        await this.fileManager.saveDataset(dataset, 'historical_data.json');
        return dataset;
    }

    // Modo real-time
    public async startRealTimeSimulation(brokerUrl: string): Promise<void> {
        if (this.isRunning) {
            throw new Error('Simulation is already running');
        }

        try {
            this.mqttClient = connect(brokerUrl);
            this.isRunning = true;
            this.visualizer.start();

            logger.info('Connected to MQTT broker', { brokerUrl });

            this.simulationInterval = setInterval(() => {
                const timestamp = new Date();
                const phase = this.getCurrentPhase(timestamp);

                for (let plcId = 0; plcId < this.plcCount; plcId++) {
                    const isAnomaly = Math.random() < this.temperatureFactor * 0.1;
                    const data: SensorData = {
                        timestamp,
                        plcId,
                        phase,
                        values: this.generateSensorValues(phase, isAnomaly),
                        anomaly: isAnomaly
                    };

                    const topic = `plc/${plcId}/metrics`;
                    this.mqttClient?.publish(topic, JSON.stringify(data));
                    this.visualizer.updateData(data);

                    logger.debug('Published sensor data', {
                        topic,
                        plcId,
                        phase,
                        isAnomaly
                    });
                }
            }, 30000);

            logger.info('Started real-time simulation', {
                plcCount: this.plcCount,
                interval: '30 seconds'
            });
        } catch (err) {
            logger.error('Error starting real-time simulation', { error: err });
            throw err;
        }
    }

    public stopRealTimeSimulation(): void {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = undefined;
        }
        if (this.mqttClient) {
            this.mqttClient.end();
            this.mqttClient = undefined;
        }
        this.isRunning = false;
        this.visualizer.stop();
        logger.info('Stopped real-time simulation');
    }

    private generateSensorValues(phase: number, isAnomaly: boolean): { [sensor: string]: number } {
        const values: { [sensor: string]: number } = {};

        Object.entries(SENSOR_RANGES).forEach(([sensor, ranges]) => {
            const [min, max] = ranges[phase];
            let value = min + Math.random() * (max - min);

            if (isAnomaly) {
                // Introducir desviación anómala
                value += (Math.random() > 0.5 ? 1 : -1) *
                    (max - min) * this.temperatureFactor;
            }

            values[sensor] = Number(value.toFixed(2));
        });

        return values;
    }

    private getCurrentPhase(currentDate: Date): number {
        const totalSeconds = (currentDate.getSeconds() % 30);
        return Math.floor(totalSeconds / 6); // 5 fases de 6 segundos
    }
}