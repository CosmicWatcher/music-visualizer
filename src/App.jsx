import { useEffect, useRef, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { easing, geometry } from 'maath';
import './App.css';
import { FFTSIZE, SAMPLERATE } from './config';

import { Canvas, extend, useFrame } from '@react-three/fiber';
import {
  CameraControls,
  Effects,
  MeshPortalMaterial,
  Stats,
  StatsGl,
  useCursor,
} from '@react-three/drei';

import { UnrealBloomPass } from 'three-stdlib';
import { DoubleSide } from 'three';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import SceneSpaceMagic from './scenes/SceneSpaceMagic';
import SceneSandbox from './scenes/SceneSandbox';

extend(geometry);
extend({ UnrealBloomPass, OutputPass });

export default function App() {
  const [location] = useLocation();
  // const [audio] = useState(new Audio());
  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const analyserRef = useRef(null);

  function setupAudio(e) {
    // audio = new Audio();
    audioRef.current.src = URL.createObjectURL(e.target.files[0]);
    audioRef.current.load();
    audioRef.current.play();
    if (contextRef.current == null) {
      contextRef.current = new AudioContext({ sampleRate: SAMPLERATE });
      const src = contextRef.current.createMediaElementSource(audioRef.current);
      analyserRef.current = contextRef.current.createAnalyser();
      src.connect(analyserRef.current);
      analyserRef.current.connect(contextRef.current.destination);
      analyserRef.current.fftSize = FFTSIZE;
    }
  }

  useEffect(() => {
    const gui = new GUI();
    let obj = {
      'Choose an audio file': function () {
        if (audioRef.current == null)
          audioRef.current = document.getElementById('audio');
        let input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.click();
        input.onchange = (e) => {
          setupAudio(e);
          // const url = 'http://streaming.tdiradio.com:8000/house.mp3';
        };
      },
    };
    gui.add(obj, 'Choose an audio file');
  });

  return (
    <>
      <div id="canvas-container">
        {location == import.meta.env.BASE_URL && (
          <Canvas
            camera={{ fov: 45, position: [0, -1, 11], far: 5000 }}
            gl={{ logarithmicDepthBuffer: true }}
            shadows={'soft'}
          >
            {/* <HandleAudio audio={audio} /> */}
            <SceneSpaceMagic analyser={analyserRef} />
            <MyCameraControls />
            <Effects disableGamma>
              <unrealBloomPass threshold={0.05} strength={0.3} radius={0.01} />
              <outputPass />
            </Effects>
            <StatsGl className="statsgl" />
            <Stats showPanel={1} className="stats" />
          </Canvas>
        )}
        {location == import.meta.env.BASE_URL + 'item/01' && (
          <Canvas
            camera={{ fov: 45, position: [0, -1, 11], far: 5000 }}
            // gl={{ logarithmicDepthBuffer: true }}
            shadows={'soft'}
          >
            <color attach={'background'} args={['#303030']} />
            <SceneSandbox />
            <MyCameraControls />
            <StatsGl className="statsgl" />
            <Stats showPanel={1} className="stats" />
          </Canvas>
        )}
      </div>
      <audio id="audio" controls />
    </>
  );
}

function MyCameraControls() {
  const cameraControlsRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key == 'r') cameraControlsRef.current.reset(true);
      if (e.key == 'w') cameraControlsRef.current.forward(10, true);
      if (e.key == 's') cameraControlsRef.current.forward(-10, true);
      if (e.key == 'a') cameraControlsRef.current.truck(-10, 0, true);
      if (e.key == 'd') cameraControlsRef.current.truck(10, 0, true);
      if (e.key == 'Control') cameraControlsRef.current.truck(0, 10, true);
      if (e.key == ' ') cameraControlsRef.current.truck(0, -10, true);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <CameraControls ref={cameraControlsRef} />;
}

// function HandleAudio(props) {
//   const [playing, setPlaying] = useState(false);

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key == 'p') {
//         setPlaying(!playing);
//         playing ? props.audio.play() : props.audio.pause();
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [playing, props.audio]);
// }
