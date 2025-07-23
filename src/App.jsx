import  { useState } from 'react';
import './App.css';
import ThreejsScene from '../components/ThreejsScene';
import SideBar from '../components/SideBar';

function App() {
  const [wallData, setWallData] = useState(null);
  const [modelLoad, setmodelLoad] = useState(null);
  const [splineEnabled, setSplineEnabled] = useState(false);
  const [splinePath, setSplinePath] = useState([]);
  const [playSpline, setPlaySpline] = useState(false);
  const [splineSpeed, setSplineSpeed] = useState(1);

  const handleWallCreate = (newWallData) => {
    setWallData(newWallData);
  };

  const handlemodelLoad = (newModelLoad) => {
    setmodelLoad(newModelLoad);
  };

  const handleEnableSpline = () => {
    setSplineEnabled((prev) => !prev);
    setSplinePath([]);
    setPlaySpline(false);
  };
  const handleAddPath = () => {
    setSplinePath((prev) => [...prev, null]);
  };
  const handlePlaySpline = () => {
    setPlaySpline(true);
  };
  const handleStopSpline = () => {
    setSplinePath([]);
    setPlaySpline(false);
    setSplineEnabled(false);
  };

  const handleUpdateSplinePath = (positions) => {
    setSplinePath(positions);
  };
  const handleSplineSpeedChange = (v) => {
    setSplineSpeed(v);
  };

  return (
    <>
      <SideBar side="left" modelLoad={handlemodelLoad} />
      <SideBar
        side="right"
        onWallCreate={handleWallCreate}
        splineEnabled={splineEnabled}
        onEnableSpline={handleEnableSpline}
        onAddPath={handleAddPath}
        onPlaySpline={handlePlaySpline}
        onStopSpline={handleStopSpline}
        splinePathLength={splinePath.filter(Boolean).length}
        splineSpeed={splineSpeed}
        onSplineSpeedChange={handleSplineSpeedChange}
      />
      <ThreejsScene
        wallData={wallData}
        modelLoad={modelLoad}
        splineEnabled={splineEnabled}
        splinePath={splinePath}
        playSpline={playSpline}
        onUpdateSplinePath={handleUpdateSplinePath}
        onStopSpline={handleStopSpline}
        splineSpeed={splineSpeed}
      />
    </>
  );
}

export default App;
