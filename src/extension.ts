import * as vscode from "vscode";
import { SimulationManager } from "./services/SimulationManager";
import { SimulationTreeProvider } from "./views/SimulationTreeProvider";
import { ClusterNodeTreeProvider } from "./views/ClusterNodeTreeProvider";
import { ClusterStatusPanel, getNodeDetailsHtml, NodeStatus } from "./panels/ClusterStatusPanel";
import { Simulation } from "./models/Simulation";
import {
    LoadBalancingStrategy,
    GPUInfo,
    NetworkInfo,
    FailureRecoveryConfig,
	DiskInfo,
} from "./types/cluster";

export function activate(context: vscode.ExtensionContext) {
    console.log("Activating IoT Cluster Simulator Extension");

    // Initialize the simulation manager
    const simulationManager = new SimulationManager();

    // Register tree view providers
    const simulationProvider = new SimulationTreeProvider(simulationManager);
    const nodeProvider = new ClusterNodeTreeProvider(simulationManager);

    vscode.window.registerTreeDataProvider(
        "iotSimulatorSimulations",
        simulationProvider
    );
    vscode.window.registerTreeDataProvider("iotSimulatorNodes", nodeProvider);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "iotSimulator.createSimulation",
            async () => {
                console.log("Creating new simulation");
                const name = await vscode.window.showInputBox({
                    prompt: "Enter simulation name",
                });
                if (!name) {
                    return;
                }

                const description = await vscode.window.showInputBox({
                    prompt: "Enter simulation description",
                });
                if (!description) {
                    return;
                }

                const nodeCount = await vscode.window.showInputBox({
                    prompt: "Enter number of nodes",
                    validateInput: (value) => {
                        const num = parseInt(value);
                        return !isNaN(num) && num > 0
                            ? null
                            : "Please enter a positive number";
                    },
                });
                if (!nodeCount) {
                    return;
                }

                try {
                    const simulation = new Simulation(
                        name,
                        description,
                        parseInt(nodeCount),
                        "Detector de anomalías",
                        "estadística",
                        "umbrales fijos",
                        "./data"
                    );

                    await simulationManager.addSimulation(simulation);
                    vscode.window.showInformationMessage(
                        "Simulation created successfully"
                    );
                    simulationProvider.refresh();
                    console.log("Simulation created:", name);
                } catch (err) {
                    console.error("Failed to create simulation:", err);
                    vscode.window.showErrorMessage(
                        `Failed to create simulation: ${err}`
                    );
                }
            }
        ),

        vscode.commands.registerCommand(
            "iotSimulator.showClusterStatus",
            () => {
                console.log("Opening cluster status panel");
                ClusterStatusPanel.createOrShow(
                    context.extensionUri,
                    simulationManager
                );
            }
        ),

        vscode.commands.registerCommand(
            "iotSimulator.showNodeDetails",
            async (
                nodeName: string,
                nodeStatus: {
                    status: NodeStatus;
                    gpus: GPUInfo[];
					disk: DiskInfo;
                    network: NetworkInfo;
                    workload: number;
                }
            ) => {
                console.log("Opening node details:", nodeName);
                const panel = vscode.window.createWebviewPanel(
                    "nodeDetails",
                    `Node Details: ${nodeName}`,
                    vscode.ViewColumn.One,
                    {}
                );

                panel.webview.html = getNodeDetailsHtml(nodeName, nodeStatus);
            }
        ),

        vscode.commands.registerCommand(
            "iotSimulator.configureLoadBalancing",
            async () => {
                console.log("Configuring load balancing strategy");
                const strategies: LoadBalancingStrategy[] = [
                    "round-robin",
                    "least-loaded",
                    "temperature-aware",
                ];
                const strategy = await vscode.window.showQuickPick(strategies, {
                    placeHolder: "Select load balancing strategy",
                });

                if (strategy) {
                    simulationManager.setLoadBalancingStrategy(
                        strategy as LoadBalancingStrategy
                    );
                    vscode.window.showInformationMessage(
                        `Load balancing strategy set to ${strategy}`
                    );
                    console.log("Load balancing strategy updated:", strategy);
                }
            }
        ),

        // New commands for simulation management
        vscode.commands.registerCommand(
            "iotSimulator.startSimulation",
            async (simulationName: string) => {
                try {
                    await simulationManager.startSimulation(simulationName);
                    vscode.window.showInformationMessage(
                        `Simulation ${simulationName} started successfully`
                    );
                    simulationProvider.refresh();
                } catch (err) {
                    vscode.window.showErrorMessage(
                        `Failed to start simulation: ${err}`
                    );
                }
            }
        ),

        vscode.commands.registerCommand(
            "iotSimulator.pauseSimulation",
            async (simulationName: string) => {
                try {
                    await simulationManager.pauseSimulation(simulationName);
                    vscode.window.showInformationMessage(
                        `Simulation ${simulationName} paused`
                    );
                    simulationProvider.refresh();
                } catch (err) {
                    vscode.window.showErrorMessage(
                        `Failed to pause simulation: ${err}`
                    );
                }
            }
        ),

        vscode.commands.registerCommand(
            "iotSimulator.stopSimulation",
            async (simulationName: string) => {
                try {
                    await simulationManager.stopSimulation(simulationName);
                    vscode.window.showInformationMessage(
                        `Simulation ${simulationName} stopped`
                    );
                    simulationProvider.refresh();
                } catch (err) {
                    vscode.window.showErrorMessage(
                        `Failed to stop simulation: ${err}`
                    );
                }
            }
        ),

        // Historical data generation
        vscode.commands.registerCommand(
            "iotSimulator.generateHistoricalData",
            async () => {
                const simulations = simulationManager.getSimulations();
                if (simulations.length === 0) {
                    vscode.window.showWarningMessage(
                        "No simulations available"
                    );
                    return;
                }

                const simulationName = await vscode.window.showQuickPick(
                    simulations.map((s) => s.name),
                    { placeHolder: "Select simulation" }
                );
                if (!simulationName) {
                    return;
                }

                const anomalyFactor = await vscode.window.showInputBox({
                    prompt: "Enter anomaly factor (0-1)",
                    validateInput: (value) => {
                        const num = parseFloat(value);
                        return isNaN(num) || num < 0 || num > 1
                            ? "Please enter a number between 0 and 1"
                            : null;
                    },
                });
                if (!anomalyFactor) {
                    return;
                }

                const startDate = await vscode.window.showInputBox({
                    prompt: "Enter start date (YYYY-MM-DD)",
                    validateInput: (value) => {
                        const date = new Date(value);
                        return isNaN(date.getTime())
                            ? "Please enter a valid date"
                            : null;
                    },
                });
                if (!startDate) {
                    return;
                }

                const endDate = await vscode.window.showInputBox({
                    prompt: "Enter end date (YYYY-MM-DD)",
                    validateInput: (value) => {
                        const date = new Date(value);
                        return isNaN(date.getTime())
                            ? "Please enter a valid date"
                            : null;
                    },
                });
                if (!endDate) {
                    return;
                }

                try {
                    await simulationManager.generateHistoricalData(
                        simulationName,
                        new Date(startDate),
                        new Date(endDate),
                        parseFloat(anomalyFactor)
                    );
                    vscode.window.showInformationMessage(
                        "Historical data generated successfully"
                    );
                } catch (err) {
                    vscode.window.showErrorMessage(
                        `Failed to generate historical data: ${err}`
                    );
                }
            }
        ),

        // Cluster configuration commands
        vscode.commands.registerCommand(
            "iotSimulator.configureFailureRecovery",
            async () => {
                const config: FailureRecoveryConfig = {
                    maxRetries: await vscode.window
                        .showInputBox({
                            prompt: "Enter maximum retries",
                            value: "3",
                            validateInput: (value) => {
                                const num = parseInt(value);
                                return isNaN(num) || num < 0
                                    ? "Please enter a positive number"
                                    : null;
                            },
                        })
                        .then((value) => parseInt(value || "3")),

                    retryDelay: await vscode.window
                        .showInputBox({
                            prompt: "Enter retry delay (ms)",
                            value: "5000",
                            validateInput: (value) => {
                                const num = parseInt(value);
                                return isNaN(num) || num < 0
                                    ? "Please enter a positive number"
                                    : null;
                            },
                        })
                        .then((value) => parseInt(value || "5000")),

                    failureThreshold: await vscode.window
                        .showInputBox({
                            prompt: "Enter failure threshold",
                            value: "3",
                            validateInput: (value) => {
                                const num = parseInt(value);
                                return isNaN(num) || num < 0
                                    ? "Please enter a positive number"
                                    : null;
                            },
                        })
                        .then((value) => parseInt(value || "3")),

                    recoveryStrategy: await vscode.window
                        .showQuickPick(["restart", "failover", "degraded"], {
                            placeHolder: "Select recovery strategy",
                        })
                        .then((value) => value || "restart"),
                } as FailureRecoveryConfig;

                simulationManager.setFailureRecoveryConfig(config);
                vscode.window.showInformationMessage(
                    "Failure recovery configuration updated"
                );
            }
        ),

        // New remote access commands
        vscode.commands.registerCommand(
            "iotSimulator.openNodeSSH",
            async (node: any) => {
                try {
                    // Get node configuration from simulation manager
                    const nodeConfig =
                        simulationManager.getNodeConfig(node.element.label);
                    if (!nodeConfig?.network?.ip) {
                        throw new Error("Node IP address not configured");
                    }

                    // Use VS Code's built-in remote SSH extension
                    const sshTarget = `ssh://${nodeConfig.network?.ip}`;
                    await vscode.commands.executeCommand(
                        "opensshremotes.openEmptyWindow",
                        {
                            host: sshTarget,
                            label: `SSH: ${node}`,
                            username: "iot-cluster", // Default username, can be configured
                        }
                    );

                    vscode.window.showInformationMessage(
                        `Opening SSH connection to ${node}`
                    );
                } catch (err) {
                    vscode.window.showErrorMessage(
                        `Failed to open SSH connection: ${err}`
                    );
                }
            }
        ),

        vscode.commands.registerCommand(
            "iotSimulator.openNodeFTP",
            async (nodeName: string) => {
                try {
                    // Get node configuration
                    const nodeConfig =
                        simulationManager.getNodeConfig(nodeName);
                    if (!nodeConfig?.network?.ip) {
                        throw new Error("Node IP address not configured");
                    }

                    // Use VS Code's built-in remote file system provider
                    const ftpUri = vscode.Uri.parse(`ftp://${nodeConfig.network?.ip}`);
                    await vscode.commands.executeCommand(
                        "vscode.openFolder",
                        ftpUri
                    );

                    vscode.window.showInformationMessage(
                        `Opening remote explorer for ${nodeName}`
                    );
                } catch (err) {
                    vscode.window.showErrorMessage(
                        `Failed to open remote explorer: ${err}`
                    );
                }
            }
        ),

        vscode.commands.registerCommand(
            "iotSimulator.openNodeGit",
            async (nodeName: string) => {
                try {
                    // Get node configuration
                    const nodeConfig =
                        simulationManager.getNodeConfig(nodeName);
                    if (!nodeConfig?.network?.ip) {
                        throw new Error("Node IP address not configured");
                    }

                    // Use VS Code's built-in Git extension
                    const gitUri = vscode.Uri.parse(
                        `git+ssh://iot-cluster@${nodeConfig.network?.ip}/home/iot-cluster/repo.git`
                    );
                    await vscode.commands.executeCommand(
                        "vscode.openFolder",
                        gitUri
                    );

                    vscode.window.showInformationMessage(
                        `Opening Git repository for ${nodeName}`
                    );
                } catch (err) {
                    vscode.window.showErrorMessage(
                        `Failed to open Git repository: ${err}`
                    );
                }
            }
        )
    );

    // Status bar item for active simulations
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
    );
    statusBarItem.text = "$(pulse) IoT Simulator";
    statusBarItem.tooltip = "Click to show cluster status";
    statusBarItem.command = "iotSimulator.showClusterStatus";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Start monitoring loop
	/* const interval = setInterval(() => {
        console.log("Refreshing tree views");

    }, vscode.workspace.getConfiguration("iotSimulator").get("refreshInterval", 5000));*/
	simulationProvider.refresh();
	nodeProvider.refresh();
    //context.subscriptions.push({ dispose: () => clearInterval(interval) });

    console.log("IoT Cluster Simulator Extension activated");
}



export function deactivate() {
    console.log("IoT Cluster Simulator Extension deactivated");
}
