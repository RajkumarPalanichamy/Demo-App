import React from 'react';
import { OrbitControls, TransformControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { CSG } from 'three-csg-ts';

function Wall({ height, width, depth, color, doorCuts }) {
  const wallMesh = useRef();
  const [wallGeometry, setWallGeometry] = useState(null);

  const baseWallGeometry = useMemo(() => {
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

    return new THREE.ExtrudeGeometry(shape, extrudeSetting);
  }, [height, width, depth]);

  useEffect(() => {
    try {
      if (!baseWallGeometry) {
        setWallGeometry(baseWallGeometry);
        return;
      }

      if (!doorCuts || doorCuts.length === 0 || doorCuts.every(cut => !cut)) {
        setWallGeometry(baseWallGeometry);
        return;
      }

      const validCuts = doorCuts.filter(cut => cut && cut.geometry);

      if (validCuts.length === 0) {
        setWallGeometry(baseWallGeometry);
        return;
      }

      let wallCSG = CSG.fromGeometry(baseWallGeometry);

      validCuts.forEach((cut, index) => {
        try {
          const cutGeometry = cut.geometry.clone();
          cutGeometry.applyMatrix4(new THREE.Matrix4().setPosition(
            cut.position.x, 
            cut.position.y, 
            cut.position.z
          ));
          
          const cutCSG = CSG.fromGeometry(cutGeometry);
          wallCSG = wallCSG.subtract(cutCSG);
        } catch (error) {
          console.warn(`Error applying CSG cut ${index}:`, error);
        }
      });

      const identityMatrix = new THREE.Matrix4();
      const resultGeometry = CSG.toGeometry(wallCSG, identityMatrix);
      setWallGeometry(resultGeometry);
    } catch (error) {
      console.error('Error in CSG operation:', error);
      setWallGeometry(baseWallGeometry);
    }
  }, [baseWallGeometry, doorCuts]);

  return (
    <mesh ref={wallMesh} geometry={wallGeometry || baseWallGeometry} position={[0, height/2, 0]}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function DoorModel({ modelLoad, onDoorMove, doorIndex }) {
  const gltf = useLoader(GLTFLoader, modelLoad);
  const doorRef = useRef();
  const [isSelected, setIsSelected] = useState(false);
  const [cutHelper, setCutHelper] = useState(null);
  const [position, setPosition] = useState([doorIndex * 3, 0, 0]);
  const [cutSize, setCutSize] = useState(null);

  const createInitialCutSize = () => {
    if (!doorRef.current || cutSize) return;

    try {
      const box = new THREE.Box3().setFromObject(doorRef.current);
      const size = box.getSize(new THREE.Vector3());

      const minSize = 0.5;
      const stableCutSize = {
        x: Math.max(size.x * 1.1, minSize),
        y: Math.max(size.y * 1.1, minSize),
        z: Math.max(size.z * 1.1, minSize)
      };

      setCutSize(stableCutSize);
    } catch (error) {
      console.warn('Error creating initial cut size:', error);
    }
  };

  const createCutGeometry = () => {
    if (!doorRef.current || !cutSize) return null;

    try {
      const cutGeometry = new THREE.BoxGeometry(cutSize.x, cutSize.y, cutSize.z);

      const cutData = {
        geometry: cutGeometry,
        position: new THREE.Vector3(...position),
        size: cutSize
      };

      setCutHelper(cutData);
      return cutData;
    } catch (error) {
      console.warn('Error creating cut geometry:', error);
      return null;
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setIsSelected(true);
  };

  const handleKeyDown = (e) => {
    if (!isSelected) return;

    const moveStep = 0.5;
    let newPosition = [...position];

    switch (e.key) {
      case 'ArrowUp':
        newPosition[1] += moveStep;
        break;
      case 'ArrowDown':
        newPosition[1] -= moveStep;
        break;
      case 'ArrowLeft':
        newPosition[0] -= moveStep;
        break;
      case 'ArrowRight':
        newPosition[0] += moveStep;
        break;
      case 'PageUp':
        newPosition[2] -= moveStep;
        break;
      case 'PageDown':
        newPosition[2] += moveStep;
        break;
      case 'Escape':
        setIsSelected(false);
        return;
      default:
        return;
    }

    setPosition(newPosition);
    
    if (doorRef.current) {
      doorRef.current.position.set(...newPosition);
    }

    const cutData = createCutGeometry();
    onDoorMove(doorIndex, cutData);
  };

  useEffect(() => {
    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, position]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (doorRef.current) {
        createInitialCutSize();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [doorRef.current, gltf]);

  useEffect(() => {
    if (cutSize && doorRef.current) {
      const cutData = createCutGeometry();
      onDoorMove(doorIndex, cutData);
    }
  }, [cutSize]);

  return (
    <group ref={doorRef} position={position}>
      <primitive 
        object={gltf.scene} 
        position={[0, 0, 0]} 
        scale={1}
        onClick={handleClick}
      />
      
      {cutHelper && (
        <mesh 
          position={cutHelper.position}
        >
          <boxGeometry args={[cutHelper.size.x, cutHelper.size.y, cutHelper.size.z]} />
          <meshBasicMaterial 
            color={isSelected ? "lime" : "red"} 
            transparent 
            opacity={0.3} 
            wireframe 
          />
        </mesh>
      )}
      
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}
    </group>
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
  const [doorCuts, setDoorCuts] = useState([]);

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
      setDoorCuts(prev => [...prev, null]);
    }
  }, [modelLoad]);

  const handleDoorMove = (doorIndex, cutData) => {
    setDoorCuts(prev => {
      const newCuts = [...prev];
      newCuts[doorIndex] = cutData;
      return newCuts;
    });
  };

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
    const baseDuration = 3000;
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
      <Canvas 
        camera={{ position: [0, 20, 20] }} 
        onCreated={({ camera }) => { cameraRef.current = camera; }}
        onClick={() => {
          setSelectedModel(null);
        }}
      >
        <OrbitControls makeDefault enabled={!cameraAnimating} />
        <ambientLight />
        <gridHelper args={[200, 200, 0x00ff00, 0x444444]} />

        <Wall
          height={boxData.height}
          width={boxData.width}
          depth={boxData.depth}
          color={boxData.color}
          doorCuts={doorCuts}
        />
        
        {splineEnabled && !cameraAnimating && renderSplineSpheres()}
        {splineEnabled && !cameraAnimating && renderSplineCurve()}
        
        <Suspense fallback={<Fallback />}>
          {models.map((model, index) => (
            <DoorModel
              key={index}
              modelLoad={model}
              doorIndex={index}
              onDoorMove={handleDoorMove}
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