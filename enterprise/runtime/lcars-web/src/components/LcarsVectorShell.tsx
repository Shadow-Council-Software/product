import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { railCodeForLabel } from '../lib/lcars-codes';
import './LcarsVectorShell.css';

export interface LcarsVectorShellProps<TMenu extends string> {
  alertPhase: 'Normal' | 'Yellow' | 'Red';
  activeMenu: TMenu;
  menuItems: readonly TMenu[];
  onMenuSelect: (menu: TMenu) => void;
  controls: ReactNode;
  children: ReactNode;
}

export function LcarsVectorShell<TMenu extends string>({
  alertPhase,
  activeMenu,
  menuItems,
  onMenuSelect,
  controls,
  children,
}: LcarsVectorShellProps<TMenu>) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="lcars-frame" data-alert-phase={alertPhase} aria-label="LCARS console frame">
      <aside className="lcars-frame__rail">
        <motion.div
          key={alertPhase}
          className="lcars-frame__elbow"
          initial={prefersReducedMotion ? false : { opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="lcars-frame__brand">LCARS</span>
        </motion.div>

        <nav className="lcars-frame__menu" aria-label="Station selection">
          {menuItems.map((item) => {
            const code = railCodeForLabel(item);
            return (
              <button
                key={item}
                type="button"
                className={`lcars-frame__menu-item ${item === activeMenu ? 'is-active' : ''}`}
                aria-pressed={item === activeMenu}
                onClick={() => onMenuSelect(item)}
              >
                <span className="lcars-frame__menu-label">{item}</span>
                {code && <span className="lcars-frame__menu-code">{code}</span>}
              </button>
            );
          })}
        </nav>

        <div className="lcars-frame__rail-controls">{controls}</div>

        <div className="lcars-frame__rail-cap" aria-hidden="true">
          1701-D
        </div>
      </aside>

      <section className="lcars-frame__stage">
        <header className="lcars-frame__header">
          <span className="lcars-frame__header-title">Enterprise Main Computer</span>
          <span className="lcars-frame__header-code" aria-hidden="true">
            LCARS 47-FB-209
          </span>
        </header>
        <div className="lcars-frame__content">{children}</div>
      </section>
    </section>
  );
}
