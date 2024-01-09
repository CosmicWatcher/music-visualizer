import { useRef } from "react";
import { PropTypes } from "prop-types";

import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

import kaleidoscopeFrag from "../shaders/kaleidoscopeMaterial.frag";
import useAudioData from "../audio";
import { modulate } from "../utils";

export default function SceneFlatShader(props) {
  const matRef = useRef();
  const planeRef = useRef();
  const threeState = useThree();
  const audioData = useAudioData(props.audio, props.analyser);

  useFrame((state) => {
    let time = state.clock.getElapsedTime();

    // planeRef.current.geometry.parameters.width = state.size.width;
    // planeRef.current.geometry.parameters.height = state.size.height;

    matRef.current.iTime = time;
    matRef.current.iWidth = planeRef.current.geometry.parameters.width;
    matRef.current.iHeight = planeRef.current.geometry.parameters.height;
    matRef.current.iTimeSpeed = 0.2;

    if (
      props.audio.current != null &&
      !props.audio.current.paused &&
      !props.audio.current.ended
    ) {
      let treb = audioData.current.trebAtt;
      let mid = audioData.current.midAtt;
      let bass = audioData.current.bassAtt;
      let vol = audioData.current.volAtt;
      // let scale = 1;

      // if (treb <= 1.0) scale = 1;
      // else scale = modulate(treb, 1.0, 1.3, 1, 2);
      matRef.current.iTreb = treb;

      //   if (vol > 1.9) {
      //     if (bass <= 0.7) scale = 0.7;
      //     else if (bass >= 1.4) scale = 1;
      //     else scale = modulate(bass, 0.7, 1.4, 0.7, 1);
      //   }

      //   scale = 1;
      //   if (vol + bass >= 2.9)
      //   scale = modulate(vol + bass, 1.7, 3, 1, 2);
      //   scale = 2 * Math.cos(bass + vol);

      //   else scale *= modulate(x, 0.7, 10, 0.3, 3);

      // if (bass > mid) matRef.current.iBass = bass;
      // else matRef.current.iBass = 0;

      matRef.current.iBass = bass;

      // console.log(bass);
    }
  });

  return (
    <mesh ref={planeRef} position={[0, 0, -1.2]}>
      <planeGeometry args={[threeState.viewport.aspect, 1, 100, 100]} />
      <kaleidoscopeMaterial ref={matRef} toneMapped={false} />
    </mesh>
  );
}

const KaleidoscopeMaterial = shaderMaterial(
  {
    iTime: 0,
    iBass: 0,
    iTreb: 0,
    iTimeSpeed: 1,
    iWidth: 1,
    iHeight: 1,
  },
  `uniform float iWidth;
   uniform float iHeight;
   varying vec2 vUv;
   void main() {
      vUv = uv * 2.0 - 1.0; // Normalized pixel coordinates (from -1 to 1)
      vUv.x *= iWidth / iHeight; // Prevent stretching
      // vUv.y -= 1.;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
   }`,
  kaleidoscopeFrag
);

extend({ KaleidoscopeMaterial });

SceneFlatShader.propTypes = {
  analyser: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  audio: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};
