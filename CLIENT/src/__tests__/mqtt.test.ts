import { ClusterNode } from '../ClusterNode';
import { NodeConfig } from '../types';
import * as mqtt from 'mqtt';

describe('ClusterNode MQTT Integration', () => {
    let node: ClusterNode;
    const testConfig: NodeConfig = {
        name: 'test-node',
        status: 'online',
        gpus: [{
            model: 'Test GPU',
            utilization: 0,
            temperature: 25,
            memory: 8192 // Fixed: Using number instead of object
        }],
        workload: 0,
        ip: '127.0.0.1',  // Added required ip property
        role: 'worker'    // Added required role property
    };

    beforeEach(() => {
        // Ensure MQTT broker URL is set
        process.env.MQTT_BROKER_URL = 'mqtt://localhost:1883';
        node = new ClusterNode(testConfig);
    });

    afterEach(() => {
        node.disconnect();
    });

    test('should connect to MQTT broker and handle commands', (done) => {
        // Fixed: Use string URL instead of potentially undefined
        const testClient = mqtt.connect('mqtt://localhost:1883');

        testClient.on('connect', () => {
            // Subscribe to node status updates
            testClient.subscribe(`iot-cluster/test-node/status`, (err) => {
                if (err) {
                    done(err);
                    return;
                }

                // Send a test command
                testClient.publish(`iot-cluster/test-node/command`, JSON.stringify({
                    type: 'requestStatus'
                }));
            });
        });

        testClient.on('message', (topic, message) => {
            const status = JSON.parse(message.toString());
            expect(status.name).toBe('test-node');
            expect(status.status).toBe('online');
            testClient.end();
            done();
        });
    }, 10000);

    test('should handle configuration updates via MQTT', (done) => {
        // Fixed: Use string URL instead of potentially undefined
        const testClient = mqtt.connect('mqtt://localhost:1883');

        testClient.on('connect', () => {
            testClient.subscribe(`iot-cluster/test-node/trace`, (err) => {
                if (err) {
                    done(err);
                    return;
                }

                // Send compression config update
                testClient.publish(`iot-cluster/test-node/command`, JSON.stringify({
                    type: 'updateConfig',
                    data: {
                        compression: {
                            enabled: true,
                            algorithm: 'gzip'
                        }
                    }
                }));
            });
        });

        testClient.on('message', (topic, message) => {
            const trace = JSON.parse(message.toString());
            expect(trace.type).toBe('info');
            expect(trace.message).toBe('Compression configuration updated');
            testClient.end();
            done();
        });
    }, 10000);
});