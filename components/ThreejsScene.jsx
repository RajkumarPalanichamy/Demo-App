import { OrbitControls, TransformControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function Box({ height, width, depth, color }) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, height);
  shape.lineTo(width, height);
  shape.lineTo(width, 0);
  shape.lineTo(0, 0);

  const extrudeSetting = {
    depth: depth,
    bevelEnabled: false,
  };
  return (
    <mesh>
      <extrudeGeometry args={[shape, extrudeSetting]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Model({ modelLoad, onClickModel }) {
  const gltf = useLoader(GLTFLoader, modelLoad);
  console.log(gltf);
  
  const modelRef = useRef();

  const handleClick = () => {
    onClickModel(modelRef.current);
  };

  return (
    <mesh ref={modelRef} onClick={handleClick}>
      <primitive position={[0, 0, 0]} object={gltf.scene} scale={1} />
    </mesh>
  );
}

function ThreejsScene({ wallData, modelLoad }) {
  const [boxData, setBoxData] = useState({
    height: 10,
    width: 20,
    depth: 1,
    color: "orange",
  });

  const [transformMode, setTransformMode] = useState("translate");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  const transformControlsRef = useRef();

  useEffect(() => {
    if (wallData) {
      const { height, width, depth } = wallData;
      setBoxData({
        height: height,
        width: width,
        depth: depth,
        color: "orange",
      });
    }
  }, [wallData]);

  useEffect(() => {
    if (modelLoad) {
      setModels((prevModels) => [...prevModels, modelLoad]);
    }
  }, [modelLoad]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key.toLowerCase()) {
        case "t":
          setTransformMode("translate");
          break;
        case "r":
          setTransformMode("rotate");
          break;
        case "s":
          setTransformMode("scale");
          break;
        case "q":
          setSelectedModel(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClickModel = (model) => {
    setSelectedModel(model);
  };

  return (
    <div className="absolute">
      <Canvas camera={{ position: [0, 20, 20] }}>
        <OrbitControls makeDefault />
        <ambientLight />
        <gridHelper args={[200, 200, 0x00ff00, 0x444444]} />
         
        <Box
          height={boxData.height}
          width={boxData.width}
          depth={boxData.depth}
          color={boxData.color}
        />      
        {models.map((model, index) => (
          <Model
            key={index}
            modelLoad={model}
            transformMode={transformMode}
            onClickModel={handleClickModel}
          />
        ))}
        {selectedModel && (
          <TransformControls
            ref={transformControlsRef}
            object={selectedModel}
            mode={transformMode}
          />
        )}
      
      </Canvas>
    </div>
  );
}

export default ThreejsScene;



