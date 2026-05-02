"use client";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls, SpotLight } from "@react-three/drei";
import CarModel from "./CarModel";
import Particles from "./Particles";

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#4488ff" />
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#E60012" distance={8} />
      <pointLight position={[3, 1, 2]} intensity={0.6} color="#C9A961" distance={6} />
      <spotLight
        position={[0, 6, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={2}
        color="#ffffff"
        castShadow
      />
    </>
  );
}

export default function CarScene() {
  return (
    <Canvas
      camera={{ position: [4, 1.5, 4], fov: 45, near: 0.1, far: 100 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <SceneLights />
      <Suspense fallback={null}>
        <CarModel />
        <Particles count={180} />
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.6}
          scale={8}
          blur={2.5}
          far={1}
          color="#E60012"
        />
        <Environment preset="city" backgroundBlurriness={1} backgroundIntensity={0.05} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={false}
      />
    </Canvas>
  );
}
