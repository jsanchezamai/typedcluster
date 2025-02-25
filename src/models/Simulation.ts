import { WorkType, Strategy, Algorithm, SimulationStatus } from '../types';

export class Simulation {
    public status: SimulationStatus = "stopped";
    public lastUpdate: Date = new Date();

    constructor(
        public name: string,
        public description: string,
        public nodeCount: number,
        public workType: WorkType,
        public strategy: Strategy,
        public algorithm: Algorithm,
        public dataDirectory: string
    ) {}

    toJSON() {
        return {
            name: this.name,
            description: this.description,
            nodeCount: this.nodeCount,
            workType: this.workType,
            strategy: this.strategy,
            algorithm: this.algorithm,
            dataDirectory: this.dataDirectory,
            status: this.status,
            lastUpdate: this.lastUpdate
        };
    }

    static fromJSON(json: any): Simulation {
        const sim = new Simulation(
            json.name,
            json.description,
            json.nodeCount,
            json.workType,
            json.strategy,
            json.algorithm,
            json.dataDirectory
        );
        sim.status = json.status;
        sim.lastUpdate = new Date(json.lastUpdate);
        return sim;
    }
}
