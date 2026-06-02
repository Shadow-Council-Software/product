import './QuickEnvPin.css';
import { QUICK_ENV_PIN_MAX_WIDTH_PX } from './constants';

export interface QuickEnvPinProps {
  authority: string;
  compact?: boolean;
  meanTempC?: number | null;
  onExpand?: () => void;
}

export function QuickEnvPin({ authority, compact, meanTempC, onExpand }: QuickEnvPinProps) {
  const isGreen = authority === 'enterprise' || authority === 'green';

  if (compact && isGreen) {
    return (
      <button
        type="button"
        className="quick-env-pin quick-env-pin--compact"
        data-authority={authority}
        style={{ maxWidth: QUICK_ENV_PIN_MAX_WIDTH_PX }}
        onClick={onExpand}
      >
        <span className="quick-env-pin__label">Quick Env</span>
        <span className="quick-env-pin__value">{meanTempC != null ? `${meanTempC} °C` : '—'}</span>
      </button>
    );
  }

  return (
    <div
      className={`quick-env-pin ${isGreen ? 'quick-env-pin--green' : 'quick-env-pin--shared'}`}
      data-authority={authority}
    >
      <span className="quick-env-pin__label">Authority</span>
      <span className="quick-env-pin__value">{isGreen ? 'Green — enterprise control' : authority}</span>
    </div>
  );
}
