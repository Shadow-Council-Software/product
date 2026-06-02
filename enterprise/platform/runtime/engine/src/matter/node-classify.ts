import type { DeviceKind } from '@enterprise/matter-port';

export function classifyMatterNode(nodeJson: string): { deviceKind: DeviceKind; label: string } {
  const s = nodeJson.toLowerCase();
  if (/thermostat|learning|hvac|occupiedheat|occupiedcool/.test(s)) {
    return { deviceKind: 'thermostat', label: 'Nest Thermostat' };
  }
  if (/doorbell|door.?bell|chime|visitor/.test(s)) {
    return { deviceKind: 'doorbell', label: 'Nest Doorbell' };
  }
  if (/camera|cam|video|doorbell.*cam|nest.?cam/.test(s)) {
    return { deviceKind: 'camera', label: 'Nest Camera' };
  }
  if (/nest|google/.test(s)) {
    return { deviceKind: 'unknown', label: 'Nest device' };
  }
  return { deviceKind: 'unknown', label: `Matter node` };
}

export function stationIdForNode(nodeId: number, deviceKind: DeviceKind): string {
  if (deviceKind === 'thermostat') return 'env.nest.primary';
  if (deviceKind === 'doorbell') return 'sec.nest.doorbell.main';
  if (deviceKind === 'camera') return 'tac.nest.camera.main';
  return `matter.node.${nodeId}`;
}
