import { SimulationManager } from './services/SimulationManager';
import { MenuSystem } from './menu';
import { logger } from './utils/logger';

async function main() {
    try {
        logger.info('Starting kit Cluster Simulator Kit');

        const simulationManager = new SimulationManager();
        const menuSystem = new MenuSystem(simulationManager);

        console.log('Bienvenido a kit Cluster Simulator Kit');
        await menuSystem.showMainMenu();

        logger.info('Application terminated normally');
        process.exit(0);
    } catch (err) {
        logger.error('Unhandled error in main application', { error: err });
        console.error('Error fatal:', err instanceof Error ? err.message : String(err));
        process.exit(1);
    }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
    logger.info('Received SIGINT signal');
    console.log('\nCerrando la aplicación...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM signal');
    console.log('\nCerrando la aplicación...');
    process.exit(0);
});

main();