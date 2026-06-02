import { SubsystemGrid, type DepartmentDef } from '../components/composites/SubsystemGrid';
import { QuickEnvPin } from '../components/environmental/QuickEnvPin';
import type { StationSnapshot } from '../lib/types';
import './OpsOverviewScreen.css';

const TEMP_PATH = '1/513/0';

export interface OpsOverviewScreenProps {
  stations: StationSnapshot[] | undefined;
  meanTempC: number | null;
  onOpenEnvironment: () => void;
  onOpenAudit: () => void;
}

export function OpsOverviewScreen({
  stations,
  meanTempC,
  onOpenEnvironment,
  onOpenAudit,
}: OpsOverviewScreenProps) {
  const thermostat = stations?.find((s) => s.stationId === 'env.nest.primary');
  const temp = thermostat?.attributes[TEMP_PATH];
  const envDetail =
    temp != null ? `${String(temp)} °C · enterprise` : 'Awaiting Matter fabric';

  const departments: DepartmentDef[] = [
    {
      id: 'environment',
      label: 'Environment',
      state: thermostat?.available ? 'NOMINAL' : 'ADVISORY',
      detail: envDetail,
      navigable: true,
    },
    { id: 'tactical', label: 'Tactical', state: 'OFFLINE', navigable: false },
    { id: 'engineering', label: 'Engineering', state: 'OFFLINE', navigable: false },
    { id: 'science', label: 'Science', state: 'OFFLINE', navigable: false },
    {
      id: 'operations',
      label: 'Operations',
      state: 'NOMINAL',
      detail: 'Soak · audit',
      navigable: true,
    },
  ];

  return (
    <div className="ops-overview" data-testid="ops.overview">
      <header className="ops-overview__header">
        <h1 className="ops-overview__title">Bridge at a Glance</h1>
        <p className="ops-overview__subtitle">ops.overview — Command horizon</p>
      </header>

      {meanTempC != null && (
        <div className="ops-overview__quick-env">
          <QuickEnvPin authority="enterprise" compact meanTempC={meanTempC} onExpand={onOpenEnvironment} />
        </div>
      )}

      <SubsystemGrid
        departments={departments}
        onSelect={(id) => {
          if (id === 'environment') onOpenEnvironment();
          if (id === 'operations') onOpenAudit();
        }}
      />

      <section className="ops-overview__roster" aria-label="Device roster">
        <h2 className="ops-overview__section-title">Active stations</h2>
        <ul className="ops-overview__station-list">
          {(stations ?? []).map((s) => (
            <li key={s.stationId}>
              <strong>{s.label ?? s.stationId}</strong>
              <span>{s.deviceKind ?? 'device'}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
