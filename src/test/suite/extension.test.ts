import * as assert from 'assert';
import * as vscode from 'vscode';
import { SimulationManager } from '../../services/SimulationManager';
import { SimulationTreeProvider } from '../../views/SimulationTreeProvider';
import { ClusterNodeTreeProvider } from '../../views/ClusterNodeTreeProvider';

suite('IoT Cluster Simulator Extension Test Suite', () => {
    vscode.window.showInformationMessage('Starting test suite');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('invendi.iot-cluster-simulator'));
    });

    test('Tree views should be registered', async () => {
        const simulationView = await vscode.window.createTreeView('iotSimulatorSimulations', {
            treeDataProvider: new SimulationTreeProvider(new SimulationManager())
        });
        assert.ok(simulationView);

        const nodeView = await vscode.window.createTreeView('iotSimulatorNodes', {
            treeDataProvider: new ClusterNodeTreeProvider(new SimulationManager())
        });
        assert.ok(nodeView);
    });

    test('Commands should be registered', () => {
        assert.ok(vscode.commands.getCommands(true).then(commands => 
            commands.includes('iotSimulator.createSimulation') &&
            commands.includes('iotSimulator.showClusterStatus') &&
            commands.includes('iotSimulator.showNodeDetails') &&
            commands.includes('iotSimulator.configureLoadBalancing')
        ));
    });
});
