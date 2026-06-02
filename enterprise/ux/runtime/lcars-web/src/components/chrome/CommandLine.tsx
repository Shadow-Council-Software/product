import './CommandLine.css';

export interface CommandLineProps {
  message: string;
  onEscalate?: () => void;
}

export function CommandLine({ message, onEscalate }: CommandLineProps) {
  return (
    <div className="command-line" data-testid="chrome.outcome" data-substrate="bridge-dark">
      <p className="command-line__message">{message}</p>
      {onEscalate && (
        <button
          type="button"
          className="lcars-btn command-line__escalate"
          data-testid="escalate-alert-demo"
          onClick={onEscalate}
        >
          Escalate
        </button>
      )}
    </div>
  );
}
