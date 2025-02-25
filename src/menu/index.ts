import inquirer from 'inquirer';
import { SimulationManager } from '../services/SimulationManager';
import { Simulation } from '../models/Simulation';
import { WorkType, Strategy, Algorithm } from '../types';
import { logger } from '../utils/logger';
import { LoadBalancingStrategy, FailureRecoveryConfig, CompressionConfig } from '../types/cluster';

type InputAnswer = { input: string };

export class MenuSystem {
    constructor(private simulationManager: SimulationManager) {}

    async showMainMenu(): Promise<void> {
        try {
            while (true) {
                const { action } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'action',
                        message: 'Seleccione una opción:',
                        choices: [
                            'Añadir simulación',
                            'Eliminar simulación',
                            'Ver simulaciones en curso',
                            'Gestionar cluster',
                            'Generar datos históricos',
                            'Iniciar simulación de sensores',
                            'Detener simulación de sensores',
                            'Salir'
                        ]
                    }
                ]);

                switch (action) {
                    case 'Añadir simulación':
                        await this.addSimulation();
                        break;
                    case 'Eliminar simulación':
                        await this.removeSimulation();
                        break;
                    case 'Ver simulaciones en curso':
                        await this.viewRunningSimulations();
                        break;
                    case 'Gestionar cluster':
                        await this.showClusterMenu();
                        break;
                    case 'Generar datos históricos':
                        await this.generateHistoricalData();
                        break;
                    case 'Iniciar simulación de sensores':
                        await this.startSensorSimulation();
                        break;
                    case 'Detener simulación de sensores':
                        await this.stopSensorSimulation();
                        break;
                    case 'Salir':
                        logger.info('Usuario seleccionó salir');
                        return;
                }
            }
        } catch (err) {
            if (err && typeof err === 'object' && 'name' in err && err.name === 'ExitPromptError') {
                logger.info('Usuario interrumpió el programa');
                return;
            }
            throw err;
        }
    }

    private async showClusterMenu(): Promise<void> {
        while (true) {
            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Gestión del Cluster:',
                    choices: [
                        'Configurar balanceo de carga',
                        'Configurar recuperación ante fallos',
                        'Configurar compresión de datos',
                        'Monitor de estado del cluster',
                        'Volver'
                    ]
                }
            ]);

            switch (action) {
                case 'Configurar balanceo de carga':
                    await this.configureLoadBalancing();
                    break;
                case 'Configurar recuperación ante fallos':
                    await this.configureFailureRecovery();
                    break;
                case 'Configurar compresión de datos':
                    await this.configureCompression();
                    break;
                case 'Monitor de estado del cluster':
                    await this.showClusterStatus();
                    break;
                case 'Volver':
                    return;
            }
        }
    }

    private async configureLoadBalancing(): Promise<void> {
        const { strategy } = await inquirer.prompt([
            {
                type: 'list',
                name: 'strategy',
                message: 'Seleccione la estrategia de balanceo:',
                choices: [
                    { name: 'Round Robin', value: 'round-robin' },
                    { name: 'Menor carga', value: 'least-loaded' },
                    { name: 'Basado en temperatura', value: 'temperature-aware' }
                ]
            }
        ]);

        this.simulationManager.setLoadBalancingStrategy(strategy as LoadBalancingStrategy);
        console.log(`Estrategia de balanceo configurada: ${strategy}`);
    }

    private async configureFailureRecovery(): Promise<void> {
        const config = await inquirer.prompt([
            {
                type: 'number',
                name: 'maxRetries',
                message: 'Número máximo de reintentos:',
                default: 3
            },
            {
                type: 'number',
                name: 'retryDelay',
                message: 'Retraso entre reintentos (ms):',
                default: 5000
            },
            {
                type: 'number',
                name: 'failureThreshold',
                message: 'Umbral de fallos:',
                default: 3
            },
            {
                type: 'list',
                name: 'recoveryStrategy',
                message: 'Estrategia de recuperación:',
                choices: [
                    { name: 'Reiniciar', value: 'restart' },
                    { name: 'Failover', value: 'failover' },
                    { name: 'Modo degradado', value: 'degraded' }
                ]
            }
        ]);

        this.simulationManager.setFailureRecoveryConfig(config as FailureRecoveryConfig);
        console.log('Configuración de recuperación actualizada:', config);
    }

    private async configureCompression(): Promise<void> {
        const config = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: '¿Habilitar compresión?',
                default: true
            },
            {
                type: 'list',
                name: 'algorithm',
                message: 'Algoritmo de compresión:',
                choices: [
                    { name: 'GZIP', value: 'gzip' },
                    { name: 'LZ4', value: 'lz4' },
                    { name: 'Ninguno', value: 'none' }
                ],
                when: (answers) => answers.enabled
            },
            {
                type: 'number',
                name: 'level',
                message: 'Nivel de compresión (1-9):',
                default: 6,
                when: (answers) => answers.enabled && answers.algorithm !== 'none',
                validate: (value: number | undefined) => {
                    if (value === undefined) {return 'Por favor, ingrese un número';}
                    return value >= 1 && value <= 9 ? true : 'El nivel debe estar entre 1 y 9';
                }
            },
            {
                type: 'number',
                name: 'threshold',
                message: 'Umbral de compresión (bytes):',
                default: 1024,
                when: (answers) => answers.enabled
            }
        ]);

        this.simulationManager.setCompressionConfig(config as CompressionConfig);
        console.log('Configuración de compresión actualizada:', config);
    }

    private async showClusterStatus(): Promise<void> {
        console.log('\nEstado del Cluster:');
        console.log('==================');

        const status = this.simulationManager.getClusterStatus();

        console.log(`\nNodos activos: ${status.activeNodes}`);
        console.log(`GPUs totales: ${status.totalGpus}`);
        console.log(`Carga promedio: ${status.averageWorkload.toFixed(2)}%\n`);

        for (const [name, nodeStatus] of status.nodes.entries()) {
            console.log(`\nNodo: ${name}`);
            console.log(`Estado: ${nodeStatus.status}`);
            console.log(`Carga: ${nodeStatus.workload.toFixed(2)}%`);
            console.log('GPUs:');
            nodeStatus.gpus.forEach((gpu, index) => {
                console.log(`  GPU ${index + 1}: ${gpu.model}`);
                console.log(`    Utilización: ${gpu.utilization.toFixed(2)}%`);
                console.log(`    Temperatura: ${gpu.temperature.toFixed(2)}°C`);
            });
            console.log('Red:');
            console.log(`  Ancho de banda: ${nodeStatus.network.bandwidth} Mbps`);
            console.log(`  Latencia: ${nodeStatus.network.latency.toFixed(2)} ms`);
            console.log(`  Pérdida de paquetes: ${nodeStatus.network.packetLoss.toFixed(2)}%`);
        }
    }

    private async addSimulation(): Promise<void> {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Nombre de la simulación:'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Descripción:'
            },
            {
                type: 'number',
                name: 'nodeCount',
                message: 'Número de nodos:'
            },
            {
                type: 'list',
                name: 'workType',
                message: 'Tipo de trabajo:',
                choices: ['Detector de anomalías', 'Trabajo genérico']
            },
            {
                type: 'list',
                name: 'strategy',
                message: 'Estrategia:',
                choices: ['estadística', 'machine learning']
            },
            {
                type: 'list',
                name: 'algorithm',
                message: 'Algoritmo:',
                choices: (answers: any) => {
                    return answers.strategy === 'estadística'
                        ? ['umbrales fijos', 'desviación estándar', 'series temporales']
                        : ['Redes neuronales', 'Árboles de decisión', 'Redes neuronales Recurrentes'];
                }
            },
            {
                type: 'input',
                name: 'dataDirectory',
                message: 'Directorio de datos:'
            }
        ]);

        const simulation = new Simulation(
            answers.name,
            answers.description,
            answers.nodeCount,
            answers.workType as WorkType,
            answers.strategy as Strategy,
            answers.algorithm as Algorithm,
            answers.dataDirectory
        );

        try {
            await this.simulationManager.addSimulation(simulation);
            console.log('Simulación añadida exitosamente');
        } catch (err) {
            console.error('Error al añadir la simulación:', err instanceof Error ? err.message : String(err));
        }
    }

    private async generateHistoricalData(): Promise<void> {
        const simulations = this.simulationManager.getSimulations();
        if (simulations.length === 0) {
            console.log('No hay simulaciones disponibles');
            return;
        }

        try {
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'simulationName',
                    message: 'Seleccione la simulación:',
                    choices: simulations.map(s => s.name)
                },
                {
                    type: 'number',
                    name: 'anomalyFactor',
                    message: 'Factor de anomalía (0-1):',
                    validate: (value: number | undefined) => {
                        if (typeof value !== 'number') {
                            return 'Por favor, ingrese un número';
                        }
                        return value >= 0 && value <= 1 ? true : 'El factor debe estar entre 0 y 1';
                    }
                },
                {
                    type: 'input',
                    name: 'startDate',
                    message: 'Fecha de inicio (YYYY-MM-DD):',
                    validate: (value: string | undefined) => {
                        if (!value) {
                            return 'Por favor, ingrese una fecha';
                        }
                        const date = new Date(value);
                        return !isNaN(date.getTime()) ? true : 'Formato de fecha inválido';
                    }
                },
                {
                    type: 'input',
                    name: 'endDate',
                    message: 'Fecha de fin (YYYY-MM-DD):',
                    validate: (value: string | undefined) => {
                        if (!value) {
                            return 'Por favor, ingrese una fecha';
                        }
                        const date = new Date(value);
                        return !isNaN(date.getTime()) ? true : 'Formato de fecha inválido';
                    }
                }
            ]);

            console.log('Generando datos históricos...');
            logger.info('Starting historical data generation process', answers);

            await this.simulationManager.generateHistoricalData(
                answers.simulationName,
                new Date(answers.startDate),
                new Date(answers.endDate),
                answers.anomalyFactor
            );
            console.log('Datos históricos generados exitosamente');
        } catch (err) {
            console.error('Error al generar datos históricos:', err instanceof Error ? err.message : String(err));
            logger.error('Error in historical data generation', { error: err });
        }
    }

    private async removeSimulation(): Promise<void> {
        const simulations = this.simulationManager.getSimulations();
        if (simulations.length === 0) {
            console.log('No hay simulaciones para eliminar');
            return;
        }

        const { simulationName } = await inquirer.prompt([
            {
                type: 'list',
                name: 'simulationName',
                message: 'Seleccione la simulación a eliminar:',
                choices: simulations.map(s => s.name)
            }
        ]);

        try {
            await this.simulationManager.removeSimulation(simulationName);
            console.log('Simulación eliminada exitosamente');
        } catch (err) {
            console.error('Error al eliminar la simulación:', err instanceof Error ? err.message : String(err));
        }
    }

    private async viewRunningSimulations(): Promise<void> {
        while (true) {
            const runningSimulations = this.simulationManager.getRunningSimulations();
            if (runningSimulations.length === 0) {
                console.log('No hay simulaciones en curso');
                return;
            }

            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Simulaciones en curso:',
                    choices: [
                        ...runningSimulations.map(s => ({
                            name: `${s.name} (${s.status})`,
                            value: s.name
                        })),
                        new inquirer.Separator(),
                        { name: 'Volver', value: 'back' }
                    ]
                }
            ]);

            if (action === 'back') {break;}

            await this.manageSimulation(action);
        }
    }

    private async manageSimulation(simulationName: string): Promise<void> {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: `Gestionar simulación ${simulationName}:`,
                choices: ['Arrancar', 'Pausar', 'Parar', 'Volver']
            }
        ]);

        try {
            switch (action) {
                case 'Arrancar':
                    await this.simulationManager.startSimulation(simulationName);
                    console.log('Simulación iniciada');
                    break;
                case 'Pausar':
                    await this.simulationManager.pauseSimulation(simulationName);
                    console.log('Simulación pausada');
                    break;
                case 'Parar':
                    await this.simulationManager.stopSimulation(simulationName);
                    console.log('Simulación detenida');
                    break;
            }
        } catch (err) {
            console.error('Error al gestionar la simulación:', err instanceof Error ? err.message : String(err));
        }
    }

    private async startSensorSimulation(): Promise<void> {
        try {
            const plcCountAnswer = await inquirer.prompt<InputAnswer>([
                {
                    type: 'input',
                    name: 'input',
                    message: 'Número de PLCs:',
                    validate: (value: string) => {
                        const num = parseInt(value);
                        return !isNaN(num) && num > 0 ? true : 'Debe ser un número positivo';
                    }
                }
            ]);

            const temperatureAnswer = await inquirer.prompt<InputAnswer>([
                {
                    type: 'input',
                    name: 'input',
                    message: 'Factor de temperatura para anomalías (0-1):',
                    validate: (value: string) => {
                        const num = parseFloat(value);
                        return !isNaN(num) && num >= 0 && num <= 1 ? true : 'Debe estar entre 0 y 1';
                    }
                }
            ]);

            const modeAnswer = await inquirer.prompt<{mode: string}>([
                {
                    type: 'list',
                    name: 'mode',
                    message: 'Modo de simulación:',
                    choices: ['Histórico', 'Tiempo real']
                }
            ]);

            const plcCount = parseInt(plcCountAnswer.input);
            const temperature = parseFloat(temperatureAnswer.input);

            if (modeAnswer.mode === 'Histórico') {
                const dateAnswers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'startDate',
                        message: 'Fecha de inicio (YYYY-MM-DD):',
                        validate: (value: string) => {
                            const date = new Date(value);
                            return !isNaN(date.getTime()) ? true : 'Formato de fecha inválido';
                        }
                    },
                    {
                        type: 'input',
                        name: 'endDate',
                        message: 'Fecha de fin (YYYY-MM-DD):',
                        validate: (value: string) => {
                            const date = new Date(value);
                            return !isNaN(date.getTime()) ? true : 'Formato de fecha inválido';
                        }
                    }
                ]);

                await this.simulationManager.startHistoricalSensorSimulation(
                    plcCount,
                    temperature,
                    new Date(dateAnswers.startDate),
                    new Date(dateAnswers.endDate)
                );
                console.log('Generación de datos históricos iniciada');
            } else {
                const mqttAnswers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'brokerUrl',
                        message: 'URL del broker MQTT:',
                        default: 'mqtt://localhost:1883'
                    }
                ]);

                await this.simulationManager.startRealtimeSensorSimulation(
                    plcCount,
                    temperature,
                    mqttAnswers.brokerUrl
                );
                console.log('Simulación en tiempo real iniciada');
            }
        } catch (err) {
            console.error('Error al iniciar la simulación:', err instanceof Error ? err.message : String(err));
            logger.error('Error starting sensor simulation', { error: err });
        }
    }

    private async stopSensorSimulation(): Promise<void> {
        try {
            await this.simulationManager.stopSensorSimulation();
            console.log('Simulación de sensores detenida');
        } catch (err) {
            console.error('Error al detener la simulación:', err instanceof Error ? err.message : String(err));
            logger.error('Error stopping sensor simulation', { error: err });
        }
    }
}