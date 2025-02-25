import * as vscode from 'vscode';
import { SimulationManager } from '../services/SimulationManager';

interface NodeStatus {
    status: string;
    workload: number;
    gpus: Array<{
        model: string;
        utilization: number;
        temperature: number;
    }>;
    network: {
        latency: number;
        bandwidth: number;
        packetLoss: number;
    };
}

interface ClusterStatus {
    nodes: Map<string, NodeStatus>;
    activeNodes: number;
    totalGpus: number;
    averageWorkload: number;
}

export class ClusterStatusPanel {
    public static currentPanel: ClusterStatusPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _updateInterval: NodeJS.Timeout;

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        private simulationManager: SimulationManager
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        // Set up regular updates
        this._updateInterval = setInterval(() => {
            this._update();
        }, vscode.workspace.getConfiguration('iotSimulator').get('refreshInterval', 5000));

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Log panel creation for debugging
        console.log('ClusterStatusPanel created');
    }

    public static createOrShow(extensionUri: vscode.Uri, simulationManager: SimulationManager) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ClusterStatusPanel.currentPanel) {
            ClusterStatusPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'clusterStatus',
            'Cluster Status',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        ClusterStatusPanel.currentPanel = new ClusterStatusPanel(panel, extensionUri, simulationManager);
    }

    private _update() {
        const status = this.simulationManager.getClusterStatus() as ClusterStatus;
        console.log('Updating cluster status panel with data:', status);
        this._panel.webview.html = this._getHtmlForWebview(status);
    }

    private _getHtmlForWebview(status: ClusterStatus): string {
        // Get path to media resources
        const stylesPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css');
        const stylesUri = this._panel.webview.asWebviewUri(stylesPath);

        const nodeRows = Array.from(status.nodes.entries())
            .map(([name, nodeStatus]) => `
                <tr>
                    <td>${name}</td>
                    <td><span class="status-${nodeStatus.status}">${nodeStatus.status}</span></td>
                    <td>${nodeStatus.workload.toFixed(2)}%</td>
                    <td>${nodeStatus.gpus.length}</td>
                    <td>${nodeStatus.network.latency.toFixed(2)} ms</td>
                </tr>
            `).join('');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cluster Status</title>
                <link href="${stylesUri}" rel="stylesheet">
                <style>
                    body { 
                        font-family: var(--vscode-font-family);
                        padding: 20px;
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    .status-online { color: var(--vscode-testing-iconPassed); }
                    .status-offline { color: var(--vscode-testing-iconFailed); }
                    .status-degraded { color: var(--vscode-testing-iconSkipped); }
                    table { 
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        background-color: var(--vscode-editor-background);
                    }
                    th, td {
                        text-align: left;
                        padding: 8px;
                        border-bottom: 1px solid var(--vscode-panel-border);
                        color: var(--vscode-foreground);
                    }
                    .metrics {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .metric-card {
                        padding: 15px;
                        background: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                    }
                    h1, h2, h3 {
                        color: var(--vscode-foreground);
                        margin-bottom: 16px;
                    }
                </style>
            </head>
            <body>
                <h1>Cluster Status Monitor</h1>

                <div class="metrics">
                    <div class="metric-card">
                        <h3>Active Nodes</h3>
                        <p>${status.activeNodes}</p>
                    </div>
                    <div class="metric-card">
                        <h3>Total GPUs</h3>
                        <p>${status.totalGpus}</p>
                    </div>
                    <div class="metric-card">
                        <h3>Average Workload</h3>
                        <p>${status.averageWorkload.toFixed(2)}%</p>
                    </div>
                </div>

                <h2>Node Details</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Node Name</th>
                            <th>Status</th>
                            <th>Workload</th>
                            <th>GPUs</th>
                            <th>Latency</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${nodeRows}
                    </tbody>
                </table>
            </body>
            </html>
        `;
    }

    public dispose() {
        ClusterStatusPanel.currentPanel = undefined;
        clearInterval(this._updateInterval);

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }

        // Log panel disposal for debugging
        console.log('ClusterStatusPanel disposed');
    }
}