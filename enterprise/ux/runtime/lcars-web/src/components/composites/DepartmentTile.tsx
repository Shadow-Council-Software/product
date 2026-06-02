import './DepartmentTile.css';

export type TileState = 'NOMINAL' | 'ADVISORY' | 'OFFLINE' | 'CONFLICT';

export interface DepartmentTileProps {
  label: string;
  state: TileState;
  detail?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function DepartmentTile({ label, state, detail, onClick, disabled }: DepartmentTileProps) {
  return (
    <button
      type="button"
      className={`dept-tile dept-tile--${state.toLowerCase()}`}
      onClick={onClick}
      disabled={disabled || state === 'OFFLINE'}
      data-state={state}
    >
      <span className="dept-tile__label">{label}</span>
      <span className="dept-tile__state">{state}</span>
      {detail && <span className="dept-tile__detail">{detail}</span>}
      {state === 'OFFLINE' && (
        <span className="dept-tile__roadmap">Growth — station not commissioned</span>
      )}
    </button>
  );
}
