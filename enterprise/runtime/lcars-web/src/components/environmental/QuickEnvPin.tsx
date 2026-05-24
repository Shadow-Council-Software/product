import './QuickEnvPin.css';
import { QUICK_ENV_PIN_PANEL_MIN_WIDTH } from './constants';

export interface QuickEnvPinProps {
  authority: string;
}

export function QuickEnvPin({ authority }: QuickEnvPinProps) {
  const isGreen = authority === 'enterprise' || authority === 'green';
  return (
    <div
      className={`quick-env-pin ${isGreen ? 'quick-env-pin--green-full' : 'quick-env-pin--shared'}`}
      data-authority={authority}
      style={{ minWidth: isGreen ? QUICK_ENV_PIN_PANEL_MIN_WIDTH : undefined }}
    >
      <span className="quick-env-pin__label">Authority</span>
      <span className="quick-env-pin__value">{isGreen ? 'Green — enterprise control' : authority}</span>
    </div>
  );
}
