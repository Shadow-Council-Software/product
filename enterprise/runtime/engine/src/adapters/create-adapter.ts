import type { MatterAdapterPort } from '@enterprise/matter-port';
import { MockMatterAdapter } from './mock-matter-adapter.js';
import { OhfSidecarAdapter } from './ohf-sidecar-adapter.js';
import { SimMatterAdapter } from './sim-matter-adapter.js';

export type AdapterKind = 'mock' | 'ohf' | 'sim';

export function createMatterAdapter(kind: AdapterKind): MatterAdapterPort {
  switch (kind) {
    case 'mock':
      return new MockMatterAdapter();
    case 'ohf':
      return new OhfSidecarAdapter();
    case 'sim':
      return new SimMatterAdapter();
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unknown MATTER_ADAPTER: ${_exhaustive}`);
    }
  }
}

export { MockMatterAdapter } from './mock-matter-adapter.js';
export { OhfSidecarAdapter } from './ohf-sidecar-adapter.js';
export { SimMatterAdapter } from './sim-matter-adapter.js';
