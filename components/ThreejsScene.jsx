import React from 'react';
import { OrbitControls, TransformControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useState, useRef } from "react";
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

function ModelLoader({ modelLoad, onClickModel }) {
  const gltf = useLoader(GLTFLoader, modelLoad);
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

function Fallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="gray" />
    </mesh>
  );
}

function ThreejsScene({ wallData, modelLoad, splineEnabled, splinePath, playSpline, onUpdateSplinePath, onStopSpline, splineSpeed = 1 }) {
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

  const [splineSpheres, setSplineSpheres] = useState([]);
  const [splineCurve, setSplineCurve] = useState(null);
  const [cameraAnimating, setCameraAnimating] = useState(false);
  const cameraRef = useRef();
  const animationRef = useRef();
  const [selectedSphere, setSelectedSphere] = useState(null);
  const sphereRefs = useRef([]);

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


  useEffect(() => {
    if (splineEnabled && splinePath.length > splineSpheres.length) {
      const newPos = [Math.random() * 10, 2, Math.random() * 10];
      setSplineSpheres((prev) => {
        const updated = [...prev, { position: newPos }];
        onUpdateSplinePath(updated.map(s => s.position));
        return updated;
      });
    }
    if (!splineEnabled) {
      setSplineSpheres([]);
      setSplineCurve(null);
      setCameraAnimating(false);
      setSelectedSphere(null);
    }
  }, [splineEnabled, splinePath.length]);

  useEffect(() => {
    if (splineSpheres.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(
        splineSpheres.map(s => new THREE.Vector3(...s.position))
      );
      setSplineCurve(curve);
    } else {
      setSplineCurve(null);
    }
  }, [splineSpheres]);

  useEffect(() => {
    if (playSpline && splineCurve && splineSpheres.length >= 2) {
      setCameraAnimating(true);
      animateCamera(0);
    } else {
      setCameraAnimating(false);
    }
    if (!playSpline) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [playSpline, splineCurve, splineSpeed]);

  const animateCamera = (progress) => {
    if (!splineCurve) return;
    const baseDuration = 3000; // ms
    const duration = baseDuration / splineSpeed;
    const step = 1 / (duration / 16);
    let t = progress;
    if (t > 1) {
      setCameraAnimating(false);
      return;
    }
    if (cameraRef.current) {
      const pos = splineCurve.getPoint(t);
      cameraRef.current.position.set(pos.x, pos.y + 5, pos.z + 10);
      cameraRef.current.lookAt(pos.x, pos.y, pos.z);
    }
    animationRef.current = requestAnimationFrame(() => animateCamera(t + step));
  };

  useEffect(() => {
    if (!splineEnabled) {
      setSplineSpheres([]);
      setSplineCurve(null);
      setCameraAnimating(false);
      cancelAnimationFrame(animationRef.current);
    }
  }, [splineEnabled]);

  useEffect(() => {
    if (!splineEnabled && splineSpheres.length > 0) {
      setSplineSpheres([]);
      setSplineCurve(null);
      setCameraAnimating(false);
      cancelAnimationFrame(animationRef.current);
    }
  }, [splineEnabled]);

  const renderSplineSpheres = () =>
    splineSpheres.map((s, i) => {
      const isSelected = selectedSphere === i;
      if (!sphereRefs.current[i]) sphereRefs.current[i] = React.createRef();
      return (
        <group key={i}>
          <mesh
            ref={sphereRefs.current[i]}
            position={s.position}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSphere(i);
            }}
          >
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color={i === 0 ? "red" : i === splineSpheres.length - 1 ? "blue" : isSelected ? "lime" : "yellow"} />
          </mesh>
          {isSelected && sphereRefs.current[i]?.current && (
            <TransformControls
              object={sphereRefs.current[i].current}
              mode="translate"
              onObjectChange={() => {
                const mesh = sphereRefs.current[i].current;
                if (mesh) {
                  const newPos = [mesh.position.x, mesh.position.y, mesh.position.z];
                  setSplineSpheres((prev) => {
                    const updated = prev.map((sphere, idx) => idx === i ? { ...sphere, position: newPos } : sphere);
                    onUpdateSplinePath(updated.map(s => s.position));
                    return updated;
                  });
                }
              }}
            />
          )}
        </group>
      );
    });

  const renderSplineCurve = () => {
    if (!splineCurve) return null;
    const points = splineCurve.getPoints(100);
    const positions = new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));
    return (
      <line key={positions.join(",")}> 
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="cyan" linewidth={2} />
      </line>
    );
  };

  return (
    <div className="absolute">
      <Canvas camera={{ position: [0, 20, 20] }} onCreated={({ camera }) => { cameraRef.current = camera; }}>
        <OrbitControls makeDefault enabled={!cameraAnimating} />
        <ambientLight />
        <gridHelper args={[200, 200, 0x00ff00, 0x444444]} />

        <Box
          height={boxData.height}
          width={boxData.width}
          depth={boxData.depth}
          color={boxData.color}
        />
        {splineEnabled && !cameraAnimating && renderSplineSpheres()}
        {splineEnabled && !cameraAnimating && renderSplineCurve()}
        <Suspense fallback={<Fallback />}>
          {models.map((model, index) => (
            <ModelLoader
              key={index}
              modelLoad={model}
              transformMode={transformMode}
              onClickModel={handleClickModel}
            />
          ))}
        </Suspense>
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



