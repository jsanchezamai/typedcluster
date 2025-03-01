import { Simulation } from '../models/Simulation';
import { ClusterNode } from '../models/ClusterNode';
import { SimulationTrace } from '../types/cluster';
import { TelemetryData, SensorData } from '../types';
import { logger } from '../utils/logger';
import path from 'path';
import * as vscode from 'vscode';

export class FileManager {
	private readonly SIMULATIONS_FILE = 'simulations.json';
	private readonly NODES_FILE = 'nodes.json';
	private readonly TRACES_DIR = 'traces';
	private readonly TELEMETRY_DIR = 'telemetry';
	private readonly DATASETS_DIR = 'datasets';
	private readonly INDEXES_DIR = 'indexes';
	private readonly DATA_DIR = __dirname + '/../data';

	constructor() {
		void this.ensureDirectoryStructure();
	}

	private async ensureDirectoryStructure(): Promise<void> {
		try {
			const dirs = [
				this.DATA_DIR,
				path.join(this.DATA_DIR, this.TRACES_DIR),
				path.join(this.DATA_DIR, this.TELEMETRY_DIR),
				path.join(this.DATA_DIR, this.DATASETS_DIR),
				path.join(this.DATA_DIR, this.INDEXES_DIR)
			];

			for (const dir of dirs) {
				const uri = vscode.Uri.file(dir);
				await vscode.workspace.fs.createDirectory(uri);
			}
			logger.info('Directory structure ensured');
		} catch (error) {
			logger.error('Error creating directory structure', { error });
		}
	}

	async saveDataset(dataset: SensorData[], fileName: string): Promise<void> {
		try {
			const filePath = path.join(this.DATA_DIR, this.DATASETS_DIR, fileName);
			const uri = vscode.Uri.file(filePath);
			const content = JSON.stringify(dataset, null, 2);
			await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
			await this.updateIndexes(dataset, fileName);
			logger.info('Dataset saved successfully', { fileName });
		} catch (error) {
			logger.error('Error saving dataset', { error, fileName });
			throw new Error(`Failed to save dataset: ${fileName}`);
		}
	}

	private async updateIndexes(dataset: SensorData[], fileName: string): Promise<void> {
		try {
			const indexPath = path.join(this.DATA_DIR, this.INDEXES_DIR, `${fileName}.index.json`);
			const uri = vscode.Uri.file(indexPath);
			const index = {
				fileName,
				timeRange: {
					start: dataset[0]?.timestamp,
					end: dataset[dataset.length - 1]?.timestamp
				},
				plcIds: [...new Set(dataset.map(d => d.plcId))],
				anomalyCount: dataset.filter(d => d.anomaly).length,
				recordCount: dataset.length
			};
			const content = JSON.stringify(index, null, 2);
			await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
			logger.debug('Index updated', { fileName });
		} catch (error) {
			logger.error('Error updating index', { error, fileName });
		}
	}

	async queryDataset(options: {
		startDate?: Date;
		endDate?: Date;
		plcId?: number;
		onlyAnomalies?: boolean;
	}): Promise<SensorData[]> {
		try {
			const indexes = await this.loadIndexes();
			const relevantFiles = this.filterRelevantFiles(indexes, options);
			const data: SensorData[] = [];

			for (const file of relevantFiles) {
				const fileData = await this.loadDatasetFile(file);
				const filteredData = this.filterData(fileData, options);
				data.push(...filteredData);
			}

			return data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
		} catch (error) {
			logger.error('Error querying dataset', { error, options });
			throw new Error('Failed to query dataset');
		}
	}

	private async loadIndexes(): Promise<any[]> {
		const indexDir = path.join(this.DATA_DIR, this.INDEXES_DIR);
		const uri = vscode.Uri.file(indexDir);
		const entries = await vscode.workspace.fs.readDirectory(uri);
		const indexes: any[] = [];

		for (const [file, type] of entries) {
			if (type === vscode.FileType.File && file.endsWith('.index.json')) {
				const fileUri = vscode.Uri.file(path.join(indexDir, file));
				const data = await vscode.workspace.fs.readFile(fileUri);
				const content = new TextDecoder('utf-8').decode(data);
				indexes.push(JSON.parse(content));
			}
		}

		return indexes;
	}

	private filterRelevantFiles(indexes: any[], options: any): string[] {
		return indexes
			.filter(index => {
				const startTime = options.startDate?.getTime() || 0;
				const endTime = options.endDate?.getTime() || Infinity;
				return index.timeRange.start <= endTime && index.timeRange.end >= startTime;
			})
			.map(index => index.fileName);
	}

	private async loadDatasetFile(fileName: string): Promise<SensorData[]> {
		const filePath = path.join(this.DATA_DIR, this.DATASETS_DIR, fileName);
		const uri = vscode.Uri.file(filePath);
		const data = await vscode.workspace.fs.readFile(uri);
		const content = new TextDecoder('utf-8').decode(data);
		return JSON.parse(content);
	}

	private filterData(data: SensorData[], options: any): SensorData[] {
		return data.filter(record => {
			if (options.startDate && record.timestamp < options.startDate) {
				return false;
			}
			if (options.endDate && record.timestamp > options.endDate) {
				return false;
			}
			if (options.plcId !== undefined && record.plcId !== options.plcId) {
				return false;
			}
			if (options.onlyAnomalies && !record.anomaly) {
				return false;
			}
			return true;
		});
	}

	async saveSimulations(simulations: Simulation[]): Promise<void> {
		try {
			const filePath = path.join(this.DATA_DIR, this.SIMULATIONS_FILE);
			const uri = vscode.Uri.file(filePath);
			const content = JSON.stringify(simulations.map(s => s.toJSON()), null, 2);
			await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
			logger.info('Simulations saved to file');
		} catch (error) {
			logger.error('Error saving simulations', { error });
			throw new Error('Failed to save simulations');
		}
	}

	async loadSimulations(): Promise<Simulation[]> {
		try {
			const filePath = path.join(this.DATA_DIR, this.SIMULATIONS_FILE);
			const uri = vscode.Uri.file(filePath);
			const data = await vscode.workspace.fs.readFile(uri);
			const content = new TextDecoder('utf-8').decode(data);
			const jsonData = JSON.parse(content);
			const simulations = jsonData.map((s: any) => Simulation.fromJSON(s));
			logger.info('Simulations loaded from file');
			return simulations;
		} catch (error) {
			logger.warn('No existing simulations file found, starting with empty list');
			return [];
		}
	}

	async saveNodes(nodes: Map<string, ClusterNode>): Promise<void> {
		try {
			const filePath = path.join(this.DATA_DIR, this.NODES_FILE);
			const uri = vscode.Uri.file(filePath);
			const nodesArray = Array.from(nodes.values()).map(node => ({
				config: node.getConfig(),
				traces: node.getTraces()
			}));
			const content = JSON.stringify(nodesArray, null, 2);
			await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
			logger.info('Nodes saved to file');
		} catch (error) {
			logger.error('Error saving nodes', { error });
			throw new Error('Failed to save nodes');
		}
	}

	async loadNodes(): Promise<Map<string, ClusterNode>> {
		try {
			const filePath = path.join(this.DATA_DIR, this.NODES_FILE);
			const uri = vscode.Uri.file(filePath);
			const data = await vscode.workspace.fs.readFile(uri);
			const content = new TextDecoder('utf-8').decode(data);
			const jsonData = JSON.parse(content);
			const nodes = new Map<string, ClusterNode>();

			jsonData.forEach((nodeData: any) => {
				const node = new ClusterNode(nodeData.config);
				nodeData.traces.forEach((trace: SimulationTrace) => {
					const traceData: Omit<SimulationTrace, 'origin'> = {
						timestamp: new Date(trace.timestamp),
						type: trace.type,
						message: trace.message,
						data: trace.data
					};
					node.emitTrace(traceData);
				});
				nodes.set(nodeData.config.name, node);
			});

			logger.info('Nodes loaded from file');
			return nodes;
		} catch (error) {
			logger.warn('No existing nodes file found, starting with empty map');
			return new Map();
		}
	}

	async saveTelemetry(simulationName: string, telemetry: TelemetryData): Promise<void> {
		try {
			const fileName = `${simulationName}_${telemetry.timestamp}.json`;
			const filePath = path.join(this.DATA_DIR, this.TELEMETRY_DIR, fileName);
			const uri = vscode.Uri.file(filePath);
			const content = JSON.stringify(telemetry, null, 2);
			await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
			logger.debug('Telemetry saved', { simulation: simulationName });
		} catch (error) {
			logger.error('Error saving telemetry', { error, simulation: simulationName });
		}
	}

	async loadTelemetry(simulationName: string): Promise<TelemetryData[]> {
		try {
			const dirPath = path.join(this.DATA_DIR, this.TELEMETRY_DIR);
			const uri = vscode.Uri.file(dirPath);
			const entries = await vscode.workspace.fs.readDirectory(uri);
			const telemetryFiles = entries
				.filter(([file, type]) => type === vscode.FileType.File && file.startsWith(simulationName))
				.map(([file]) => file);

			const telemetryData: TelemetryData[] = [];
			for (const file of telemetryFiles) {
				const fileUri = vscode.Uri.file(path.join(dirPath, file));
				const data = await vscode.workspace.fs.readFile(fileUri);
				const content = new TextDecoder('utf-8').decode(data);
				telemetryData.push(JSON.parse(content));
			}

			return telemetryData.sort((a, b) => a.timestamp - b.timestamp);
		} catch (error) {
			logger.warn('No telemetry data found', { simulation: simulationName });
			return [];
		}
	}
}