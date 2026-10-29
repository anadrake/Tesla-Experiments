import { MotionConfig } from 'motion/react';
import { useEffect } from 'react';
import { DisplayShell } from './shell/DisplayShell';
import { Stage } from './shell/Stage';
import { MapView } from './screens/Map/Map';
import { CarPanel } from './components/CarPanel/CarPanel';
import { WidgetLayer } from './components/WidgetBar/WidgetLayer';
import { StatusCluster } from './shell/StatusCluster';
import { Overlays } from './overlays/Overlays';
import { useHud } from './state/store';
import { initUrlSync } from './state/url';

initUrlSync();

export function App() {
  const mode = useHud((s) => s.mode);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  // reducedMotion="user": honours iPad Settings › Accessibility › Reduce Motion (motion components skip transforms)
  return (
    <MotionConfig reducedMotion="user">
      <Stage>
        <DisplayShell main={<MapView />} left={
            <>
              <CarPanel />
              <WidgetLayer />
            </>
          } status={<StatusCluster />} overlay={<Overlays />} />
      </Stage>
    </MotionConfig>
  );
}
