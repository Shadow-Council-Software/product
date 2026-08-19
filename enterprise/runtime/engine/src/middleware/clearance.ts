import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ClearanceTier } from '@enterprise/matter-port';

declare module 'fastify' {
  interface FastifyRequest {
    clearance: ClearanceTier;
  }
}

const ORDER: ClearanceTier[] = ['Guest', 'Crew', 'Captain'];

export function parseClearance(header: string | undefined): ClearanceTier {
  if (header === 'Captain' || header === 'Crew' || header === 'Guest') {
    return header;
  }
  return 'Guest';
}

export function clearanceAtLeast(have: ClearanceTier, need: ClearanceTier): boolean {
  return ORDER.indexOf(have) >= ORDER.indexOf(need);
}

export async function clearancePlugin(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  request.clearance = parseClearance(request.headers['x-clearance'] as string | undefined);
}

export function requireClearance(min: ClearanceTier) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!clearanceAtLeast(request.clearance, min)) {
      return reply.status(403).send({
        outcomeType: 'Denied',
        message: 'Insufficient clearance',
        cause: `Requires ${min}`,
        remediation: 'Authenticate with higher clearance tier',
      });
    }
  };
}
