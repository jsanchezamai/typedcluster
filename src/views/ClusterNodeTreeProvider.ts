/**
 * @packageDocumentation
 * Tree view implementation for displaying IoT cluster nodes in the VS Code sidebar.
 * Provides a hierarchical view of cluster nodes with their status, GPU information,
 * and quick actions.
 */

import * as vscode from 'vscode';
import { SimulationManager } from '../services/SimulationManager';
import { GPUInfo, NetworkInfo, NodeStatus } from '../types/cluster';

/**
 * Interface defining the status information for a cluster node
 * @internal
 */
interface NodeStatusInfo {
    status: NodeStatus;
    gpus: GPUInfo[];
    network: NetworkInfo;
    workload: number;
}

/**
 * Base tree item class for cluster nodes
 * Represents a node in the cluster with its status and available actions
 * @internal
 */
class NodeTreeItem extends vscode.TreeItem {
    constructor(
        public nodeName: string,
        public nodeStatus: NodeStatusInfo
    ) {
        super(
            nodeName,
            vscode.TreeItemCollapsibleState.Collapsed
        );
        this.tooltip = `Status: ${nodeStatus.status}\nWorkload: ${nodeStatus.workload.toFixed(1)}%`;
        this.description = `${nodeStatus.status} - ${nodeStatus.workload.toFixed(1)}%`;
        this.contextValue = 'node';

        // Set icon based on status using built-in theme icons
        this.iconPath = {
            id: nodeStatus.status === 'online' ? 'pass' :
                nodeStatus.status === 'degraded' ? 'warning' : 'error',
            color: nodeStatus.status === 'online' ? 
                new vscode.ThemeColor('testing.iconPassed') :
                nodeStatus.status === 'degraded' ?
                    new vscode.ThemeColor('testing.iconSkipped') :
                    new vscode.ThemeColor('testing.iconFailed')
        } as vscode.ThemeIcon;

        // Add command to handle click
        this.command = {
            command: 'iotSimulator.showNodeDetails',
            title: 'Show Node Details',
            arguments: [this.nodeName, this.nodeStatus]
        };
    }
}

/**
 * Tree item representing a detail row for a cluster node
 * @internal
 */
class NodeDetailItem extends NodeTreeItem {
    constructor(
        label: string,
        nodeName: string,
        nodeStatus: NodeStatusInfo
    ) {
        super(nodeName, nodeStatus);
        this.label = label;
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }
}

/**
 * Tree item representing an action that can be performed on a node
 * @internal
 */
class NodeActionItem extends NodeTreeItem {
    constructor(
        label: string,
        iconId: string,
        nodeName: string,
        nodeStatus: NodeStatusInfo,
        command?: vscode.Command
    ) {
        super(nodeName, nodeStatus);
        this.label = label;
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        this.iconPath = { id: iconId } as vscode.ThemeIcon;
        this.command = command;
    }
}

/**
 * Tree data provider for displaying cluster nodes and their status in VS Code's sidebar.
 * Implements the VS Code TreeDataProvider interface to create a hierarchical view of nodes.
 * 
 * @example
 * ```typescript
 * const nodeProvider = new ClusterNodeTreeProvider(simulationManager);
 * vscode.window.registerTreeDataProvider('iotSimulatorNodes', nodeProvider);
 * ```
 */
export class ClusterNodeTreeProvider implements vscode.TreeDataProvider<NodeTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NodeTreeItem | undefined | null> = new vscode.EventEmitter<NodeTreeItem | undefined | null>();
    readonly onDidChangeTreeData: vscode.Event<NodeTreeItem | undefined | null> = this._onDidChangeTreeData.event;

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
    getTreeItem(element: NodeTreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * Gets the children for a given element in the tree view
     * @param element - The parent element to get children for
     * @returns An array of child tree items
     */
    async getChildren(element?: NodeTreeItem): Promise<NodeTreeItem[]> {
        if (!element) {
            // Root level - show all nodes
            const status = this.simulationManager.getClusterStatus();
            return Array.from(status.nodes.entries()).map(([name, nodeStatus]) => 
                new NodeTreeItem(name, nodeStatus as NodeStatusInfo)
            );
        }

        // Child level - show node details and actions
        const details: NodeTreeItem[] = [];

        // Add node details
        if (element.nodeStatus.gpus && element.nodeStatus.gpus.length > 0) {
            details.push(new NodeDetailItem(`GPUs: ${element.nodeStatus.gpus.length}`, element.nodeName, element.nodeStatus));
            element.nodeStatus.gpus.forEach((gpu, index) => {
                details.push(new NodeDetailItem(
                    `GPU ${index + 1}: ${gpu.model} (${gpu.utilization.toFixed(1)}%, ${gpu.temperature.toFixed(1)}°C)`,
                    element.nodeName,
                    element.nodeStatus
                ));
            });
        }

        details.push(new NodeDetailItem(
            `Workload: ${element.nodeStatus.workload.toFixed(1)}%`,
            element.nodeName,
            element.nodeStatus
        ));
        details.push(new NodeDetailItem(
            `Network: ${element.nodeStatus.network.bandwidth}Mbps, ${element.nodeStatus.network.latency.toFixed(1)}ms`,
            element.nodeName,
            element.nodeStatus
        ));

        // Add action items
        details.push(
            new NodeActionItem('Open in SSH Terminal', 'terminal', element.nodeName, element.nodeStatus, {
                command: 'remote-ssh.connect',
                title: 'Open SSH Terminal',
                arguments: [{
                    host: element.nodeName,
                    user: 'iot',
                    port: 22
                }]
            }),
            new NodeActionItem('Open in Remote Explorer', 'folder-opened', element.nodeName, element.nodeStatus, {
                command: 'remoteHub.openRepository',
                title: 'Open in Remote Explorer',
                arguments: [`sftp://${element.nodeName}`]
            }),
            new NodeActionItem('Open in Source Control', 'git-branch', element.nodeName, element.nodeStatus, {
                command: 'git.clone',
                title: 'Open in Source Control',
                arguments: [`ssh://iot@${element.nodeName}/var/iot/repo.git`]
            })
        );

        return details;
    }
}