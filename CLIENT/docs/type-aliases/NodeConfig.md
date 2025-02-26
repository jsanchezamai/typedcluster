[**IoT Cluster Client v1.0.0**](../README.md)

***

[IoT Cluster Client](../globals.md) / NodeConfig

# Type Alias: NodeConfig

> **NodeConfig**: `object`

Defined in: [types.ts:17](TypedClusterTypedClusterClusterSimulator/blob/80166f2c04bb6b92e3c371f272ffd6689f4fe724/iot-cluster-client/src/types.ts#L17)

## Type declaration

### name

> **name**: `string`

### ip

> **ip**: `string`

### role

> **role**: `"worker"` \| `"manager"`

### gpus?

> `optional` **gpus**: [`GPUInfo`](GPUInfo.md)[]

### network?

> `optional` **network**: [`NetworkInfo`](NetworkInfo.md)

### status?

> `optional` **status**: [`NodeStatus`](NodeStatus.md)

### lastHeartbeat?

> `optional` **lastHeartbeat**: `Date`

### workload?

> `optional` **workload**: `number`

### failureCount?

> `optional` **failureCount**: `number`

### compressionEnabled?

> `optional` **compressionEnabled**: `boolean`
