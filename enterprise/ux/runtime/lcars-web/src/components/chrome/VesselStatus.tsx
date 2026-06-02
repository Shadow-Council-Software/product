import type { AlertSnapshot, ClearanceTier } from '../../lib/types';
import './VesselStatus.css';

export interface VesselStatusProps {
  alert: AlertSnapshot | undefined;
  clearance: ClearanceTier;
  siteName?: string;
}

export function VesselStatus({
  alert,
  clearance,
  siteName = 'USS Onimurasame · Residence',
}: VesselStatusProps) {
  const phase = alert?.phase ?? 'Normal';
  return (
    <div className="vessel-status" data-testid="chrome.vessel" data-substrate="bridge-dark">
      <div className="vessel-status__row">
        <span className="vessel-status__condition">Condition: {phase}</span>
        <span className="vessel-status__clearance">Clearance: {clearance}</span>
      </div>
      <div className="vessel-status__site">{siteName}</div>
      <div className="vessel-status__hybrid">POSTURE: HYBRID · EXTERNAL CONTROLLER ACTIVE</div>
    </div>
  );
}
