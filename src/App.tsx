import { useEffect } from 'react';
import { DisplayShell } from './shell/DisplayShell';
import { Stage } from './shell/Stage';
import { MapView } from './screens/Map/Map';
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
      {/* TODO P2: left = <CarPanel /> (PRND, battery, car, music bar) */}
      <DisplayShell main={<MapView />} />
    </Stage>
  );
}
