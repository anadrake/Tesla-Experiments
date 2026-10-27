import { useEffect } from 'react';
import { Stage } from './shell/Stage';
import { useHud } from './state/store';
import { initUrlSync } from './state/url';

initUrlSync();

export function App() {
  const mode = useHud((s) => s.mode);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  return (
    <Stage>
      {/* Phase 1 replaces this with <DisplayShell /> */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <p className="text-body-s" style={{ color: 'var(--color-content-tertiary)' }}>
          Design concept · not affiliated with Tesla, Inc.
        </p>
      </div>
    </Stage>
  );
}
