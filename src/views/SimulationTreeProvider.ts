/**
 * @packageDocumentation
 * Tree view implementation for displaying IoT cluster simulations in the VS Code sidebar.
 * Provides a hierarchical view of simulations with their status, configuration,
 * and available actions.
 */

import * as vscode from 'vscode';
import { SimulationManager } from '../services/SimulationManager';
import { Simulation } from '../models/Simulation';

/**
 * Base tree item class for simulations
 * Represents a simulation with its status and available actions
 * @internal
 */
class SimulationTreeItem extends vscode.TreeItem {
    constructor(public simulation: Simulation) {
        super(
            simulation.name,
            vscode.TreeItemCollapsibleState.Collapsed
        );
        this.tooltip = simulation.description;
        this.description = simulation.status;
        this.contextValue = 'simulation';

        // Set icon based on status
        this.iconPath = { 
            id: simulation.status === 'running' ? 'play-circle' : 
                simulation.status === 'paused' ? 'debug-pause' : 'debug-stop'
        } as vscode.ThemeIcon;

        // Add command to handle click
        this.command = {
            command: 'iotSimulator.showClusterStatus',
            title: 'Show Cluster Status',
            arguments: [this.simulation]
        };
    }
}

/**
 * Tree item representing a detail row for a simulation
 * @internal
 */
class SimulationDetailItem extends SimulationTreeItem {
    constructor(label: string, simulation: Simulation) {
        super(simulation);
        this.label = label;
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }
}

/**
 * Tree item representing an action that can be performed on a simulation
 * @internal
 */
class SimulationActionItem extends SimulationTreeItem {
    constructor(
        label: string,
        iconId: string,
        simulation: Simulation,
        command?: vscode.Command
    ) {
        super(simulation);
        this.label = label;
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        this.iconPath = { id: iconId } as vscode.ThemeIcon;
        this.command = command;
    }
}

/**
 * Tree data provider for displaying simulations and their status in VS Code's sidebar.
 * Implements the VS Code TreeDataProvider interface to create a hierarchical view of simulations.
 * 
 * @example
 * ```typescript
 * const simulationProvider = new SimulationTreeProvider(simulationManager);
 * vscode.window.registerTreeDataProvider('iotSimulatorSimulations', simulationProvider);
 * ```
 */
export class SimulationTreeProvider implements vscode.TreeDataProvider<SimulationTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SimulationTreeItem | undefined | null> = new vscode.EventEmitter<SimulationTreeItem | undefined | null>();
    readonly onDidChangeTreeData: vscode.Event<SimulationTreeItem | undefined | null> = this._onDidChangeTreeData.event;

    constructor(private simulationManager: SimulationManager) {}

    /**
     * Triggers a refresh of the tree view
     */
    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    /**
     * Returns the tree item for the given element
     * @param element - The tree item to get
     */
    getTreeItem(element: SimulationTreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * Gets the children for a given element in the tree view
     * @param element - The parent element to get children for
     * @returns An array of child tree items
     */
    async getChildren(element?: SimulationTreeItem): Promise<SimulationTreeItem[]> {
        if (!element) {
            // Root level - show all simulations
            const simulations = this.simulationManager.getSimulations();
            return simulations.map(sim => new SimulationTreeItem(sim));
        }

        // Child level - show simulation details and controls
        const details: SimulationTreeItem[] = [
            new SimulationDetailItem(`Nodes: ${element.simulation.nodeCount}`, element.simulation),
            new SimulationDetailItem(`Type: ${element.simulation.workType}`, element.simulation),
            new SimulationDetailItem(`Strategy: ${element.simulation.strategy}`, element.simulation),
            new SimulationDetailItem(`Algorithm: ${element.simulation.algorithm}`, element.simulation),
            new SimulationActionItem('Generate Historical Data', 'calendar', element.simulation, {
                command: 'iotSimulator.generateHistoricalData',
                title: 'Generate Historical Data',
                arguments: [element.simulation.name]
            })
        ];

        // Add status-specific actions
        switch (element.simulation.status) {
            case 'stopped':
                details.push(
                    new SimulationActionItem('Start Simulation', 'play', element.simulation, {
                        command: 'iotSimulator.startSimulation',
                        title: 'Start Simulation',
                        arguments: [element.simulation.name]
                    })
                );
                break;
            case 'running':
                details.push(
                    new SimulationActionItem('Pause Simulation', 'debug-pause', element.simulation, {
                        command: 'iotSimulator.pauseSimulation',
                        title: 'Pause Simulation',
                        arguments: [element.simulation.name]
                    }),
                    new SimulationActionItem('Stop Simulation', 'debug-stop', element.simulation, {
                        command: 'iotSimulator.stopSimulation',
                        title: 'Stop Simulation',
                        arguments: [element.simulation.name]
                    })
                );
                break;
            case 'paused':
                details.push(
                    new SimulationActionItem('Resume Simulation', 'play', element.simulation, {
                        command: 'iotSimulator.startSimulation',
                        title: 'Resume Simulation',
                        arguments: [element.simulation.name]
                    }),
                    new SimulationActionItem('Stop Simulation', 'debug-stop', element.simulation, {
                        command: 'iotSimulator.stopSimulation',
                        title: 'Stop Simulation',
                        arguments: [element.simulation.name]
                    })
                );
                break;
        }

        return details;
    }
}