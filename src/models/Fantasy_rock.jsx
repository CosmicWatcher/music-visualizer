/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 fantasy_rock.glb --transform 
Files: fantasy_rock.glb [9.33MB] > fantasy_rock-transformed.glb [706.63KB] (92%)
Author: Nivia-3d (https://sketchfab.com/niviapoles)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/fantasy-rock-b8cc5ea579604c54811f14c6f89cc44d
Title: Fantasy Rock
*/

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PropTypes } from "prop-types";
import { modulate } from "../utils";
import useAudioData from "../audio";

export function FantasyRock(props) {
  const { nodes, materials } = useGLTF(
    import.meta.env.BASE_URL + "models/fantasy_rock-transformed.glb"
  );
  const rockBase = useRef();
  const rockFloating = useRef();
  const rand = Math.random();
  const audioData = useAudioData(props.audio, props.analyser);

  useFrame((state) => {
    let time = state.clock.getElapsedTime();

    rockFloating.current.rotation.z = 0.2 * time;

    let speed = 0.8;
    rockFloating.current.rotation.y =
      0.01 * rand +
      0.03 *
        (Math.sin(speed * time * 0.3) +
          Math.sin(speed * time * 0.094) +
          Math.sin(speed * time * 0.165));
    rockFloating.current.rotation.x =
      0.01 * rand +
      -Math.PI / 2 +
      0.03 *
        (Math.sin(speed * time * 0.2) +
          Math.sin(speed * time * 0.084) +
          Math.sin(speed * time * 0.155));

    // rockFloating.current.position.y = 0.7 * Math.sin(time);

    if (
      props.audio.current != null &&
      !props.audio.current.paused &&
      !props.audio.current.ended
    ) {
      let x = audioData.current.trebAtt;

      let emissivity = 1;
      if (x <= 1.0) emissivity = 1;
      else emissivity = modulate(x, 1.0, 1.3, 1, 8);
      rockFloating.current.material.emissiveIntensity =
        emissivity < 15 ? emissivity : 15;

      x = audioData.current.bassAtt;
      let scale = 1;
      if (x <= 0.7) scale = 1;
      else if (x >= 1.4) scale = 1.2;
      else scale = modulate(x, 0.7, 1.4, 0.8, 1.2);
      rockFloating.current.scale.x =
        rockFloating.current.scale.y =
        rockFloating.current.scale.z =
          scale;
    } else {
      rockFloating.current.material.emissiveIntensity =
        5 * (1.1 + Math.sin(time));
      rockFloating.current.scale.x =
        rockFloating.current.scale.y =
        rockFloating.current.scale.z =
          1 + 0.08 * Math.sin(time);
    }
  });

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes["rocks_03Group10022_0_Material_#25_0"].geometry}
        material={materials.Material_25}
        rotation={[-Math.PI / 2, 0, props.zRotation]}
        ref={rockBase}
      />
      <mesh
        geometry={nodes["Object001_Material_#26_0"].geometry}
        material={materials.Material_26}
        rotation={[-Math.PI / 2, 0, 0]}
        ref={rockFloating}
      />
    </group>
  );
}

FantasyRock.propTypes = {
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
//   import.meta.env.BASE_URL + 'models/fantasy_rock-transformed.glb'
// );
