[**IoT Cluster Client v1.0.0**](../README.md)

***

[IoT Cluster Client](../globals.md) / ClusterNode

# Class: ClusterNode

Defined in: [ClusterNode.ts:60](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L60)

Represents a node in an IoT cluster with capabilities for GPU management,
failure recovery, and MQTT-based communication.

## Example

```typescript
const node = new ClusterNode({
  name: 'worker-1',
  ip: '192.168.1.100',
  role: 'worker',
  gpus: [{
    model: 'NVIDIA A100',
    memory: 80,
    utilization: 0,
    temperature: 35
  }]
});
```

## Constructors

### new ClusterNode()

> **new ClusterNode**(`config`): [`ClusterNode`](ClusterNode.md)

Defined in: [ClusterNode.ts:90](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L90)

Creates a new cluster node instance

#### Parameters

##### config

[`NodeConfig`](../type-aliases/NodeConfig.md)

Configuration object for the node

#### Returns

[`ClusterNode`](ClusterNode.md)

## Properties

### traces

> `private` **traces**: [`NodeTrace`](../type-aliases/NodeTrace.md)[] = `[]`

Defined in: [ClusterNode.ts:61](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L61)

***

### status

> `private` **status**: `"online"` \| `"offline"` \| `"degraded"` = `'offline'`

Defined in: [ClusterNode.ts:62](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L62)

***

### gpus

> `private` **gpus**: [`GPUInfo`](../type-aliases/GPUInfo.md)[] = `[]`

Defined in: [ClusterNode.ts:63](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L63)

***

### workload

> `private` **workload**: `number` = `0`

Defined in: [ClusterNode.ts:64](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L64)

***

### failureCount

> `private` **failureCount**: `number` = `0`

Defined in: [ClusterNode.ts:65](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L65)

***

### lastHeartbeat

> `private` **lastHeartbeat**: `Date`

Defined in: [ClusterNode.ts:66](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L66)

***

### mqttClient

> `private` **mqttClient**: `null` \| `MqttClient` = `null`

Defined in: [ClusterNode.ts:67](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L67)

***

### mqttTopic

> `private` `readonly` **mqttTopic**: `string`

Defined in: [ClusterNode.ts:68](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L68)

***

### compressionConfig

> `private` **compressionConfig**: [`CompressionConfig`](../type-aliases/CompressionConfig.md)

Defined in: [ClusterNode.ts:71](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L71)

Configuration for data compression

***

### recoveryConfig

> `private` **recoveryConfig**: [`FailureRecoveryConfig`](../type-aliases/FailureRecoveryConfig.md)

Defined in: [ClusterNode.ts:79](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L79)

Configuration for failure recovery behavior

***

### config

> `private` **config**: [`NodeConfig`](../type-aliases/NodeConfig.md)

Defined in: [ClusterNode.ts:90](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L90)

Configuration object for the node

## Methods

### initializeMQTT()

> `private` **initializeMQTT**(): `void`

Defined in: [ClusterNode.ts:102](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L102)

**`Internal`**

Initializes MQTT connection and sets up message handlers

#### Returns

`void`

***

### setupMessageHandlers()

> `private` **setupMessageHandlers**(): `void`

Defined in: [ClusterNode.ts:131](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L131)

**`Internal`**

Sets up MQTT message and error handlers

#### Returns

`void`

***

### handleCommand()

> `private` **handleCommand**(`command`): `void`

Defined in: [ClusterNode.ts:153](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L153)

**`Internal`**

Handles incoming MQTT command messages

#### Parameters

##### command

`CommandMessage`

The command message to process

#### Returns

`void`

***

### publishStatus()

> `private` **publishStatus**(): `void`

Defined in: [ClusterNode.ts:176](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L176)

**`Internal`**

Publishes current node status via MQTT

#### Returns

`void`

***

### updateHeartbeat()

> **updateHeartbeat**(`data`): `void`

Defined in: [ClusterNode.ts:199](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L199)

Updates the node's heartbeat information

#### Parameters

##### data

[`HeartbeatData`](../type-aliases/HeartbeatData.md)

New heartbeat data

#### Returns

`void`

***

### emitTrace()

> `private` **emitTrace**(`trace`): `void`

Defined in: [ClusterNode.ts:230](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L230)

**`Internal`**

Emits a trace event for monitoring and debugging

#### Parameters

##### trace

[`NodeTrace`](../type-aliases/NodeTrace.md)

Trace information to emit

#### Returns

`void`

***

### handleFailure()

> **handleFailure**(): `boolean`

Defined in: [ClusterNode.ts:251](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L251)

Handles node failure events and initiates recovery if needed

#### Returns

`boolean`

boolean indicating if recovery was initiated

***

### restart()

> `private` **restart**(): `void`

Defined in: [ClusterNode.ts:283](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L283)

**`Internal`**

Restarts the node after a failure

#### Returns

`void`

***

### initiateFailover()

> `private` **initiateFailover**(): `void`

Defined in: [ClusterNode.ts:302](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L302)

**`Internal`**

Initiates failover process for the node

#### Returns

`void`

***

### enterDegradedMode()

> `private` **enterDegradedMode**(): `void`

Defined in: [ClusterNode.ts:317](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L317)

**`Internal`**

Switches the node to degraded mode

#### Returns

`void`

***

### selectOptimalGPU()

> **selectOptimalGPU**(`strategy`): `null` \| [`GPUInfo`](../type-aliases/GPUInfo.md)

Defined in: [ClusterNode.ts:333](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L333)

Selects the optimal GPU based on the specified strategy

#### Parameters

##### strategy

[`LoadBalancingStrategy`](../type-aliases/LoadBalancingStrategy.md) = `'least-loaded'`

Load balancing strategy to use

#### Returns

`null` \| [`GPUInfo`](../type-aliases/GPUInfo.md)

The selected GPU or null if none available

***

### getWorkload()

> **getWorkload**(): `number`

Defined in: [ClusterNode.ts:356](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L356)

Gets the current workload of the node

#### Returns

`number`

Current workload percentage

***

### getTraces()

> **getTraces**(): [`NodeTrace`](../type-aliases/NodeTrace.md)[]

Defined in: [ClusterNode.ts:364](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L364)

Gets the trace history of the node

#### Returns

[`NodeTrace`](../type-aliases/NodeTrace.md)[]

Array of trace events

***

### clearTraces()

> **clearTraces**(): `void`

Defined in: [ClusterNode.ts:371](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L371)

Clears the trace history

#### Returns

`void`

***

### getConfig()

> **getConfig**(): [`NodeConfig`](../type-aliases/NodeConfig.md) & `object`

Defined in: [ClusterNode.ts:379](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L379)

Gets the current configuration of the node

#### Returns

[`NodeConfig`](../type-aliases/NodeConfig.md) & `object`

Combined configuration and status information

***

### setCompressionConfig()

> **setCompressionConfig**(`config`): `void`

Defined in: [ClusterNode.ts:398](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L398)

Updates the compression configuration

#### Parameters

##### config

`Partial`\<[`CompressionConfig`](../type-aliases/CompressionConfig.md)\>

New compression settings

#### Returns

`void`

***

### setRecoveryConfig()

> **setRecoveryConfig**(`config`): `void`

Defined in: [ClusterNode.ts:412](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L412)

Updates the failure recovery configuration

#### Parameters

##### config

`Partial`\<[`FailureRecoveryConfig`](../type-aliases/FailureRecoveryConfig.md)\>

New recovery settings

#### Returns

`void`

***

### disconnect()

> **disconnect**(): `void`

Defined in: [ClusterNode.ts:425](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/ClusterNode.ts#L425)

Disconnects from the MQTT broker and cleans up resources

#### Returns

`void`
