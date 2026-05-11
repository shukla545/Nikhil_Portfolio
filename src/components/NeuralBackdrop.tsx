"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const lines = useRef<THREE.LineSegments>(null);

  const { positions, linePositions } = useMemo(() => {
    const count = 90;
    const coords: number[] = [];
    const links: number[] = [];

    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() - 0.5) * 9;
      const y = (Math.random() - 0.5) * 5;
      const z = (Math.random() - 0.5) * 3.5;
      coords.push(x, y, z);
    }

    for (let i = 0; i < count - 1; i += 3) {
      links.push(
        coords[i * 3],
        coords[i * 3 + 1],
        coords[i * 3 + 2],
        coords[(i + 1) * 3],
        coords[(i + 1) * 3 + 1],
        coords[(i + 1) * 3 + 2]
      );
    }

    return {
      positions: new Float32Array(coords),
      linePositions: new Float32Array(links)
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (points.current) {
      points.current.rotation.y = t * 0.055;
      points.current.rotation.x = Math.sin(t * 0.24) * 0.05;
    }
    if (lines.current) {
      lines.current.rotation.y = t * 0.055;
      lines.current.rotation.x = Math.sin(t * 0.24) * 0.05;
    }
  });

  return (
    <group position={[1.2, 0, -1.2]}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#62f4bd" size={0.035} sizeAttenuation transparent opacity={0.75} />
      </points>
      <lineSegments ref={lines}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#69d2ff" transparent opacity={0.18} />
      </lineSegments>
    </group>
  );
}

export function NeuralBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 58 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <ParticleField />
      </Canvas>
    </div>
  );
}
