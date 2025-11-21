
import React, { useState, useCallback } from 'react';
import ShiftView from './components/ShiftView';
import ReportsView from './components/ReportsView';
import Topbar from './components/Topbar';
import { useShiftManager } from './hooks/useShiftManager';

export type View = 'shift' | 'reports';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('shift');
  const shiftManager = useShiftManager();

  const handleSetView = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  return (
    <div className="max-w-4xl h-full mx-auto">
      <div className="h-full bg-[#0d1424] overflow-hidden flex flex-col">
        <Topbar
          currentShift={shiftManager.state.currentShift}
          metrics={shiftManager.metrics}
          currentView={currentView}
          setView={handleSetView}
        />
        {currentView === 'shift' ? (
          <ShiftView {...shiftManager} />
        ) : (
          <ReportsView history={shiftManager.state.history} driverId={shiftManager.driverId} />
        )}
      </div>
    </div>
  );
};

export default App;