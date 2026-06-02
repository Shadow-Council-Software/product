import { DepartmentTile, type TileState } from './DepartmentTile';
import './SubsystemGrid.css';

export interface DepartmentDef {
  id: string;
  label: string;
  state: TileState;
  detail?: string;
  navigable?: boolean;
}

export interface SubsystemGridProps {
  departments: DepartmentDef[];
  onSelect: (id: string) => void;
}

export function SubsystemGrid({ departments, onSelect }: SubsystemGridProps) {
  return (
    <div className="subsystem-grid" data-testid="subsystem-grid">
      {departments.map((d) => (
        <DepartmentTile
          key={d.id}
          label={d.label}
          state={d.state}
          detail={d.detail}
          disabled={!d.navigable}
          onClick={d.navigable ? () => onSelect(d.id) : undefined}
        />
      ))}
    </div>
  );
}
