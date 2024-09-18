// ThreeBackground.js

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

function RotatingCube() {
  return (
    <mesh rotation={[10, 20, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#61dafb" />
    </mesh>
  );
}

const ThreeBackground = () => {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        width: '100%',
        height: '100%',
      }}
      camera={{ position: [0, 0, 5] }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RotatingCube />
      <Stars />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

export default ThreeBackground;
