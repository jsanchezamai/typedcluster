import { Simulation } from '../models/Simulation';
import { TelemetryData, PhaseRanges } from '../types';
import { logger } from '../utils/logger';
import { FileManager } from './FileManager';

export class TelemetryGenerator {
    private generators: Map<string, NodeJS.Timeout> = new Map();
    private readonly defaultRanges: PhaseRanges = {
        s1: [
            { min: 0, max: 5 },
            { min: 5, max: 10 },
            { min: 15, max: 16 },
            { min: 5, max: 10 },
            { min: 0, max: 5 }
        ],
        s2: [
            { min: 0, max: 5 },
            { min: 0, max: 5 },
            { min: 10, max: 15 },
            { min: 0, max: 5 },
            { min: 0, max: 5 }
        ],
        s3: [
            { min: 0, max: 5 },
            { min: 10, max: 20 },
            { min: 20, max: 30 },
            { min: 10, max: 20 },
            { min: 0, max: 5 }
        ],
        s4: [
            { min: 0, max: 30 },
            { min: 30, max: 35 },
            { min: 35, max: 40 },
            { min: 40, max: 45 },
            { min: 45, max: 50 }
        ],
        s5: [
            { min: 0, max: 1 },
            { min: 1, max: 2 },
            { min: 3, max: 4 },
            { min: 3, max: 2 },
            { min: 1, max: 0 }
        ]
    };

    constructor(private fileManager: FileManager) {}

    private generateValue(min: number, max: number, anomalyFactor: number = 0): number {
        let value = min + Math.random() * (max - min);

        if (anomalyFactor > 0 && Math.random() < anomalyFactor) {
            // Introduce anomalía basada en el factor de temperatura
            const deviation = (max - min) * anomalyFactor;
            value += (Math.random() > 0.5 ? 1 : -1) * deviation;
        }

        return Number(value.toFixed(2));
    }

    private generateTelemetry(phase: number, anomalyFactor: number = 0): TelemetryData {
        logger.debug('Generating telemetry data', { phase, anomalyFactor });

        const telemetry: TelemetryData = {
            timestamp: Date.now(),
            phase,
            values: {
                s1: this.generateValue(this.defaultRanges.s1[phase].min, this.defaultRanges.s1[phase].max, anomalyFactor),
                s2: this.generateValue(this.defaultRanges.s2[phase].min, this.defaultRanges.s2[phase].max, anomalyFactor),
                s3: this.generateValue(this.defaultRanges.s3[phase].min, this.defaultRanges.s3[phase].max, anomalyFactor),
                s4: this.generateValue(this.defaultRanges.s4[phase].min, this.defaultRanges.s4[phase].max, anomalyFactor),
                s5: this.generateValue(this.defaultRanges.s5[phase].min, this.defaultRanges.s5[phase].max, anomalyFactor)
            }
        };

        logger.debug('Generated telemetry data', { telemetry });
        return telemetry;
    }

    async generateHistoricalData(simulation: Simulation, startDate: Date, endDate: Date, anomalyFactor: number = 0): Promise<void> {
        try {
            if (startDate > endDate) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }

            logger.info('Starting historical data generation', {
                simulation: simulation.name,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                anomalyFactor
            });

            let currentDate = new Date(startDate);
            let phase = 0;
            let count = 0;

            while (currentDate <= endDate) {
                const telemetry = this.generateTelemetry(phase, anomalyFactor);
                telemetry.timestamp = currentDate.getTime();

                await this.fileManager.saveTelemetry(simulation.name, telemetry);
                count++;

                if (count % 100 === 0) {
                    logger.info('Generation progress', {
                        simulation: simulation.name,
                        recordsGenerated: count,
                        currentTimestamp: currentDate.toISOString()
                    });
                }

                // Avanzar 6 segundos (un ciclo completo es 30 segundos / 5 fases)
                currentDate = new Date(currentDate.getTime() + 6000);
                phase = (phase + 1) % 5;
            }

            logger.info('Historical data generation completed', {
                simulation: simulation.name,
                totalRecords: count,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
        } catch (error) {
            logger.error('Error generating historical data', {
                simulation: simulation.name,
                error
            });
            throw error;
        }
    }

    startGeneration(simulation: Simulation): void {
        if (this.generators.has(simulation.name)) {
            logger.warn('Generation already running for simulation', {
                simulation: simulation.name
            });
            return;
        }

        let phase = 0;
        const interval = setInterval(async () => {
            try {
                const telemetry = this.generateTelemetry(phase);
                await this.fileManager.saveTelemetry(simulation.name, telemetry);
                phase = (phase + 1) % 5;
            } catch (error) {
                logger.error('Error in telemetry generation cycle', {
                    simulation: simulation.name,
                    error
                });
            }
        }, 6000); // 30 seconds / 5 phases = 6 seconds per phase

        this.generators.set(simulation.name, interval);
        logger.info('Started telemetry generation', {
            simulation: simulation.name
        });
    }

    stopGeneration(simulation: Simulation): void {
        const interval = this.generators.get(simulation.name);
        if (interval) {
            clearInterval(interval);
            this.generators.delete(simulation.name);
            logger.info('Stopped telemetry generation', {
                simulation: simulation.name
            });
        }
    }

    pauseGeneration(simulation: Simulation): void {
        this.stopGeneration(simulation);
        logger.info('Paused telemetry generation', {
            simulation: simulation.name
        });
    }
}