import { useRef } from 'react';
import { createNoise2D, createNoise3D } from 'simplex-noise';

import { useFrame } from '@react-three/fiber';
import {
  RenderTexture,
  PerspectiveCamera,
  useTexture,
} from '@react-three/drei';

import { BackSide, PointsMaterial } from 'three';

//initialise simplex noise instance
const noise2D = createNoise2D();
const noise3D = createNoise3D();

export default function SceneSandbox() {
  return (
    <>
      <RegularSphere
        scale={60}
        position={[0, 150, -600]}
        rotation={[0, Math.PI / 2, 0]}
      />

      <PointSphere
        scale={1}
        position={[-20, 8, -20]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <WireSphere scale={1} position={[20, 8, -20]} />

      <RenderedTexture scale={3} position={[0, -2, -20]} />
    </>
  );
}

function RenderedTexture(props) {
  return (
    <mesh {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial>
        <RenderTexture attach="map">
          <PerspectiveCamera
            makeDefault
            manual
            aspect={1 / 1}
            position={[0, 0, -5]}
          />
          <color attach="background" args={['orange']} />
          <mesh>
            <boxGeometry args={[500, 500, 500, 100, 100, 100]} />
            <meshStandardMaterial color={'blue'} />
          </mesh>
        </RenderTexture>
      </meshStandardMaterial>
    </mesh>
  );
}

function RegularSphere(props) {
  const ball = useRef();

  const texture = useTexture(
    import.meta.env.BASE_URL +
      'textures/meteorites-2560x1440-stars-planet-4k-15557.jpg'
  );

  useFrame((state) => {
    let time = state.clock.getElapsedTime();

    ball.current.rotation.y = 0.5 * time;
  });

  return (
    <mesh ref={ball} {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  );
}

function PointSphere(props) {
  const ball = useRef();

  const texture = useTexture(
    import.meta.env.BASE_URL +
      'textures/jupiter-2560x1440-space-stars-4k-19726.jpg'
  );

  useFrame((state) => {
    let time = state.clock.getElapsedTime();

    ball.current.rotation.y = 0.5 * time;

    const { geometry } = ball.current;
    const { position } = geometry.attributes;
    for (let i = 0; i < position.count; i++) {
      let mag = Math.sqrt(
        position.getX(i) * position.getX(i) +
          position.getY(i) * position.getY(i) +
          position.getZ(i) * position.getZ(i)
      );
      let x = position.getX(i) / mag;
      let y = position.getY(i) / mag;
      let z = position.getZ(i) / mag;
      var distance =
        geometry.parameters.radius * 2 +
        Math.abs(noise3D(x + time * 0.1, y + time * 0.3, z + time * 0.5) * 3);
      position.setXYZ(i, x * distance, y * distance, z * distance);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  const pMaterial = new PointsMaterial();
  pMaterial.size = 0.1;
  pMaterial.map = texture;

  return (
    <points ref={ball} {...props} material={pMaterial}>
      <sphereGeometry args={[1, 100, 100]} />
    </points>
  );
}

function WireSphere(props) {
  const ball = useRef();

  useFrame((state) => {
    let time = state.clock.getElapsedTime();

    ball.current.rotation.y = ball.current.rotation.z = 0.5 * time;

    const { geometry } = ball.current;
    const { position } = geometry.attributes;
    for (let i = 0; i < position.count; i++) {
      let mag = Math.sqrt(
        position.getX(i) * position.getX(i) +
          position.getY(i) * position.getY(i) +
          position.getZ(i) * position.getZ(i)
      );
      let x = position.getX(i) / mag;
      let y = position.getY(i) / mag;
      let z = position.getZ(i) / mag;
      var distance =
        geometry.parameters.radius * 2 +
        Math.abs(noise3D(x + time * 0.1, y + time * 0.3, z + time * 0.5) * 3);
      position.setXYZ(i, x * distance, y * distance, z * distance);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={ball} {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial wireframe color={'darkgreen'} side={BackSide} />
    </mesh>
  );
}
