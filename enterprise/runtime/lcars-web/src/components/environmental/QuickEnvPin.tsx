import './QuickEnvPin.css';

export interface QuickEnvPinProps {
  authority: string;
}

/**
 * W-CT-04: Green authority spans full Environmental panel width (no horizontal
 * scroll); shared authority is width-capped via CSS. Read-only chrome — no actuation.
 */
export function QuickEnvPin({ authority }: QuickEnvPinProps) {
  const isGreen = authority === 'enterprise' || authority === 'green';
  return (
    <div
      className={`quick-env-pin ${isGreen ? 'quick-env-pin--green-full' : 'quick-env-pin--shared'}`}
      data-authority={authority}
    >
      <span className="quick-env-pin__label">Authority</span>
      <span className="quick-env-pin__value">{isGreen ? 'Green — enterprise control' : authority}</span>
    </div>
  );
}
