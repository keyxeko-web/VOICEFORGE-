"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial } from "three";
import * as THREE from "three";

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* Tire */}
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.16, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* Rim */}
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 0.18, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Center hub */}
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 8]} />
        <meshStandardMaterial color="#C9A961" metalness={1} roughness={0.1} />
      </mesh>
      {/* Spokes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
          <boxGeometry args={[0.025, 0.19, 0.025]} />
          <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

export default function CarModel() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05 - 0.05;
    }
  });

  const bodyMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#1a1a2e",
        metalness: 0.85,
        roughness: 0.15,
        envMapIntensity: 1.2,
      }),
    []
  );

  const glassMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#88aabb",
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.6,
      }),
    []
  );

  const lightMat = useMemo(
    () => new MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 1.5 }),
    []
  );

  const tailMat = useMemo(
    () => new MeshStandardMaterial({ color: "#ff2222", emissive: "#ff0000", emissiveIntensity: 1.0 }),
    []
  );

  const chromeMat = useMemo(
    () => new MeshStandardMaterial({ color: "#C9A961", metalness: 1, roughness: 0.05 }),
    []
  );

  const underbodyMat = useMemo(
    () => new MeshStandardMaterial({ color: "#0a0a12", roughness: 0.9 }),
    []
  );

  return (
    <group ref={groupRef} scale={1.1}>
      {/* === MAIN BODY === */}
      <mesh material={bodyMat} position={[0, 0.12, 0]}>
        <boxGeometry args={[2.6, 0.52, 1.1]} />
      </mesh>

      {/* Body side skirts */}
      <mesh material={underbodyMat} position={[0, -0.06, 0.58]}>
        <boxGeometry args={[2.3, 0.12, 0.04]} />
      </mesh>
      <mesh material={underbodyMat} position={[0, -0.06, -0.58]}>
        <boxGeometry args={[2.3, 0.12, 0.04]} />
      </mesh>

      {/* === CABIN (roof + windows) === */}
      {/* Roof */}
      <mesh material={bodyMat} position={[0.05, 0.58, 0]}>
        <boxGeometry args={[1.35, 0.38, 0.92]} />
      </mesh>

      {/* Front windshield */}
      <mesh material={glassMat} position={[0.73, 0.44, 0]} rotation={[0, 0, -0.42]}>
        <boxGeometry args={[0.62, 0.04, 0.86]} />
      </mesh>

      {/* Rear windshield */}
      <mesh material={glassMat} position={[-0.63, 0.44, 0]} rotation={[0, 0, 0.42]}>
        <boxGeometry args={[0.62, 0.04, 0.86]} />
      </mesh>

      {/* Side windows (left) */}
      <mesh material={glassMat} position={[0.24, 0.52, 0.47]}>
        <boxGeometry args={[0.5, 0.25, 0.02]} />
      </mesh>
      <mesh material={glassMat} position={[-0.22, 0.52, 0.47]}>
        <boxGeometry args={[0.5, 0.25, 0.02]} />
      </mesh>
      {/* Side windows (right) */}
      <mesh material={glassMat} position={[0.24, 0.52, -0.47]}>
        <boxGeometry args={[0.5, 0.25, 0.02]} />
      </mesh>
      <mesh material={glassMat} position={[-0.22, 0.52, -0.47]}>
        <boxGeometry args={[0.5, 0.25, 0.02]} />
      </mesh>

      {/* === HOOD === */}
      <mesh material={bodyMat} position={[1.08, 0.25, 0]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.82, 0.06, 1.0]} />
      </mesh>

      {/* === TRUNK === */}
      <mesh material={bodyMat} position={[-1.08, 0.25, 0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.6, 0.06, 1.0]} />
      </mesh>

      {/* === FRONT BUMPER === */}
      <mesh material={bodyMat} position={[1.36, 0.04, 0]}>
        <boxGeometry args={[0.14, 0.32, 1.0]} />
      </mesh>
      {/* Bumper lower lip */}
      <mesh material={underbodyMat} position={[1.36, -0.14, 0]}>
        <boxGeometry args={[0.14, 0.06, 0.94]} />
      </mesh>

      {/* === REAR BUMPER === */}
      <mesh material={bodyMat} position={[-1.36, 0.04, 0]}>
        <boxGeometry args={[0.14, 0.32, 1.0]} />
      </mesh>

      {/* === GRILLE === */}
      <mesh material={chromeMat} position={[1.44, 0.1, 0]}>
        <boxGeometry args={[0.02, 0.14, 0.6]} />
      </mesh>
      {[0.15, 0, -0.15].map((z, i) => (
        <mesh key={i} material={underbodyMat} position={[1.43, 0.1, z]}>
          <boxGeometry args={[0.03, 0.12, 0.03]} />
        </mesh>
      ))}

      {/* === HEADLIGHTS === */}
      <mesh material={lightMat} position={[1.38, 0.15, 0.36]}>
        <boxGeometry args={[0.06, 0.07, 0.24]} />
      </mesh>
      <mesh material={lightMat} position={[1.38, 0.15, -0.36]}>
        <boxGeometry args={[0.06, 0.07, 0.24]} />
      </mesh>
      {/* DRL strips */}
      <mesh material={lightMat} position={[1.37, 0.06, 0.36]}>
        <boxGeometry args={[0.04, 0.025, 0.28]} />
      </mesh>
      <mesh material={lightMat} position={[1.37, 0.06, -0.36]}>
        <boxGeometry args={[0.04, 0.025, 0.28]} />
      </mesh>

      {/* === TAILLIGHTS === */}
      <mesh material={tailMat} position={[-1.38, 0.15, 0.36]}>
        <boxGeometry args={[0.05, 0.09, 0.26]} />
      </mesh>
      <mesh material={tailMat} position={[-1.38, 0.15, -0.36]}>
        <boxGeometry args={[0.05, 0.09, 0.26]} />
      </mesh>
      {/* Tail light strip connecting */}
      <mesh material={tailMat} position={[-1.38, 0.15, 0]}>
        <boxGeometry args={[0.03, 0.025, 0.58]} />
      </mesh>

      {/* === EXHAUST === */}
      <mesh material={chromeMat} position={[-1.4, -0.14, 0.28]}>
        <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
      </mesh>
      <mesh material={chromeMat} position={[-1.4, -0.14, -0.28]}>
        <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
      </mesh>

      {/* === ROOF SPOILER === */}
      <mesh material={bodyMat} position={[-0.67, 0.79, 0]}>
        <boxGeometry args={[0.1, 0.06, 0.88]} />
      </mesh>

      {/* === CHROME TRIM === */}
      <mesh material={chromeMat} position={[0, 0.38, 0.556]}>
        <boxGeometry args={[2.2, 0.012, 0.012]} />
      </mesh>
      <mesh material={chromeMat} position={[0, 0.38, -0.556]}>
        <boxGeometry args={[2.2, 0.012, 0.012]} />
      </mesh>

      {/* === WHEELS === */}
      <Wheel position={[0.92, -0.2, 0.62]} />
      <Wheel position={[0.92, -0.2, -0.62]} />
      <Wheel position={[-0.92, -0.2, 0.62]} />
      <Wheel position={[-0.92, -0.2, -0.62]} />

      {/* === SHADOW PLANE === */}
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 1.6]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
