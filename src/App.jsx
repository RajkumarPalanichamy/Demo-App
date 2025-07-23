import  { useState } from 'react';
import './App.css';
import ThreejsScene from '../components/ThreejsScene';
import SideBar from '../components/SideBar';

function App() {
  const [wallData, setWallData] = useState(null);
  const [modelLoad, setmodelLoad] = useState(null);

  const handleWallCreate = (newWallData) => {
    setWallData(newWallData);
  };

  const handlemodelLoad = (newModelLoad) => {
    setmodelLoad(newModelLoad);
  };

  return (
    <>
      <SideBar side="left" modelLoad={handlemodelLoad} />
      <SideBar side="right" onWallCreate={handleWallCreate} />
      <ThreejsScene wallData={wallData} modelLoad={modelLoad} />
    </>
  );
}

export default App;
