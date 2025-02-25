export interface SensorPhaseRanges {
    [sensor: string]: [number, number][];
}

export const SENSOR_RANGES: SensorPhaseRanges = {
    s1: [[0,5], [5,10], [15,16], [5,10], [0,5]],
    s2: [[0,5], [0,5], [10,15], [0,5], [0,5]],
    s3: [[0,5], [10,20], [20,30], [10,20], [0,5]],
    s4: [[0,30], [30,35], [35,40], [40,45], [45,50]],
    s5: [[0,1], [1,2], [3,4], [2,3], [1,0]]
};