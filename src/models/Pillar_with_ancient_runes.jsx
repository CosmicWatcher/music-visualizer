/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 pillar_with_ancient_runes.glb --transform 
Files: pillar_with_ancient_runes.glb [3.84MB] > pillar_with_ancient_runes-transformed.glb [382.45KB] (90%)
Author: SangeetBlaze (https://sketchfab.com/SangeetBlaze)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/pillar-with-ancient-runes-531bb525783f41f6a070e6694520f82c
Title: Pillar with Ancient Runes
*/

import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { PropTypes } from "prop-types";
import { Vector3 } from "three";
import { modulate } from "../utils";
import useAudioData from "../audio";

export function Pillar(props) {
  const { nodes, materials } = useGLTF(
    import.meta.env.BASE_URL +
      "models/pillar_with_ancient_runes-transformed.glb"
  );
  const pillar = useRef();
  const audioData = useAudioData(props.audio, props.analyser);

  useFrame((state) => {
    let time = state.clock.getElapsedTime();

    if (
      props.audio.current != null &&
      !props.audio.current.paused &&
      !props.audio.current.ended
    ) {
      let x = audioData.current.trebAtt;

      let emissivity = 1;
      if (x <= 1.0) emissivity = 1;
      else emissivity = modulate(x, 1.0, 1.3, 1, 5);
      pillar.current.material.emissiveIntensity =
        emissivity < 7 ? emissivity : 7;
    } else {
      pillar.current.material.emissiveIntensity =
        1.8 * (1.1 + Math.sin(time * 1));
    }

    let r = new Vector3();
    pillar.current.getWorldPosition(r);
    if (r.z <= -412.5) {
      pillar.current.position.y = 0.008 * r.z + 4.37;
    } else {
      pillar.current.position.y = 1.07;
    }
  });

  return (
    <group {...props} dispose={null}>
      <mesh
        ref={pillar}
        geometry={nodes.polySurface1_Material002_0.geometry}
        material={materials["Material.002"]}
        rotation={[-Math.PI / 2, 0, props.zRotation]}
      />
    </group>
  );
}

Pillar.propTypes = {
  zRotation: PropTypes.number,
  analyser: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  audio: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};

// useGLTF.preload(
//   import.meta.env.BASE_URL + 'models/pillar_with_ancient_runes-transformed.glb'
// );
