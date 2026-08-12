import { useState } from 'react';
import { LcarsScreen } from '../framework/LcarsScreen';
import { SCREENS, SCREEN_MAP } from '../framework/screens';
import type { AlertPhase, Clearance, LcarsContext } from '../framework/types';
import '../tokens/okuda.css';
import './LcarsLab.css';

const ALERTS: AlertPhase[] = ['Normal', 'Yellow', 'Red'];
const CLEARANCES: Clearance[] = ['Guest', 'Crew', 'Captain'];

/**
 * POC harness: a vector-screen gallery with live permutation controls so we
 * can see every screen across alert phase / clearance / conflict states.
 */
export function LcarsLab() {
  const [screenId, setScreenId] = useState(SCREENS[0].id);
  const [alertPhase, setAlertPhase] = useState<AlertPhase>('Normal');
  const [clearance, setClearance] = useState<Clearance>('Captain');
  const [conflictActive, setConflictActive] = useState(false);

  const ctx: LcarsContext = { alertPhase, clearance, conflictActive };
  const screen = SCREEN_MAP[screenId] ?? SCREENS[0];

  function handleNav(id: string) {
    if (SCREEN_MAP[id]) setScreenId(id);
  }

  return (
    <div className="lab" data-alert-phase={alertPhase}>
      <header className="lab__bar">
        <div className="lab__group">
          <span className="lab__legend">Screen</span>
          <select className="lab__select" value={screenId} onChange={(e) => setScreenId(e.target.value)}>
            {SCREENS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.family} — {s.title}
              </option>
            ))}
          </select>
        </div>

        <div className="lab__group">
          <span className="lab__legend">Alert</span>
          {ALERTS.map((a) => (
            <button key={a} className={`lab__chip ${alertPhase === a ? 'is-on' : ''}`} data-alert={a} onClick={() => setAlertPhase(a)}>
              {a}
            </button>
          ))}
        </div>

        <div className="lab__group">
          <span className="lab__legend">Clearance</span>
          {CLEARANCES.map((c) => (
            <button key={c} className={`lab__chip ${clearance === c ? 'is-on' : ''}`} onClick={() => setClearance(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="lab__group">
          <span className="lab__legend">Conflict</span>
          <button className={`lab__chip ${conflictActive ? 'is-on' : ''}`} data-alert={conflictActive ? 'Red' : undefined} onClick={() => setConflictActive((v) => !v)}>
            {conflictActive ? 'Active' : 'Clear'}
          </button>
        </div>
      </header>

      <main className="lab__stage">
        <LcarsScreen screen={screen} ctx={ctx} activeNavId={screenId} onNavSelect={handleNav} />
      </main>
    </div>
  );
}
