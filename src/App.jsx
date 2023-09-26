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
          // const url = '/Nascence.mp3';
          // const { source, data } = suspend(() => createAudio(url), [url]);
        };
      },
    };
    gui.add(obj, 'Choose an audio file');
  });

  return (
    <>
      <div id="canvas-container">
        {/* {location == "/" && <MainCanvas />} */}
        {location == '/' && (
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
        {location == '/item/02' && (
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

// function MainCanvas() {
//   return (
//     <>
//       <Canvas camera={{ fov: 45, position: [0, 0, 40] }} shadows={"soft"}>
//         <color attach="background" args={["green"]} />

//         <mesh position={[0, 0.4, 38]} rotation={[0, 0, 0]}>
//           <Frame id="01" name="space magic" author="Aryan">
//             <SceneSpaceMagic />
//           </Frame>
//         </mesh>

//         {/* <mesh>
//     <roundedPlaneGeometry args={[2, 3, 0.1]} />
//     <meshStandardMaterial>
//       <RenderTexture attach="map">
//         <SceneSpaceMagic />
//       </RenderTexture>
//     </meshStandardMaterial>
//   </mesh> */}

//         {/* <CameraControls
//           minPolarAngle={Math.PI / 2.2}
//           maxPolarAngle={Math.PI / 1.8}
//         /> */}

//         <StatsGl className="statsgl" />
//         <Stats showPanel={1} className="stats" />
//       </Canvas>
//     </>
//   );
// }

// function Frame({
//   id,
//   name,
//   author,
//   bg,
//   width = 1.6,
//   height = 0.7,
//   children,
//   ...props
// }) {
//   const portal = useRef();
//   const [, setLocation] = useLocation();
//   const [, params] = useRoute("/item/:id");
//   const [hovered, hover] = useState(false);
//   useCursor(hovered);
//   // useFrame((state, dt) =>
//   //   easing.damp(portal.current, "blend", params?.id === id ? 1 : 0, 0.2, dt)
//   // );
//   return (
//     <group {...props}>
//       <mesh
//         name={id}
//         onClick={(e) => (
//           e.stopPropagation(), setLocation("/item/" + e.object.name)
//         )}
//         onPointerOver={(e) => hover(true)}
//         onPointerOut={() => hover(false)}
//       >
//         <roundedPlaneGeometry args={[width, height, 0.1]} />
//         <MeshPortalMaterial
//           ref={portal}
//           events={params?.id === id}
//           side={DoubleSide}
//           worldUnits
//         >
//           {/* <color attach="background" args={[bg]} /> */}
//           {children}
//         </MeshPortalMaterial>
//       </mesh>
//     </group>
//   );
// }

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

// function useAudio(url) {
//   const [audio] = useState(new Audio(url));
//   const [playing, setPlaying] = useState(false);

//   const toggle = () => setPlaying(!playing);

//   useEffect(() => {
//     playing ? audio.play() : audio.pause();
//   }, [playing, audio]);

//   useEffect(() => {
//     audio.addEventListener('ended', () => setPlaying(false));
//     return () => {
//       audio.removeEventListener('ended', () => setPlaying(false));
//     };
//   }, [audio]);

//   return [playing, toggle];
// }

// function AudioSetup() {
//   let url;

//   useEffect(() => {
//     const gui = new GUI();
//     let obj = {
//       'Choose an audio file': function () {
//         let input = document.createElement('input');
//         input.setAttribute('type', 'file');
//         input.click();
//         input.onchange = (e) => {
//           url = URL.createObjectURL(e.target.files[0]);
//         };
//       },
//     };
//     gui.add(obj, 'Choose an audio file');
//   }, []);

//   const [playing, toggle] = useAudio(
//     'http://streaming.tdiradio.com:8000/house.mp3'
//   );
// }

// async function createAudio(url) {
//   // Fetch audio data and create a buffer source
//   const res = await fetch(url);
//   const buffer = await res.arrayBuffer();
//   const context = new (window.AudioContext || window.webkitAudioContext)();
//   const source = context.createBufferSource();
//   source.buffer = await new Promise((res) =>
//     context.decodeAudioData(buffer, res)
//   );
//   source.loop = true;

//   // // This is why it doesn't run in Safari 🍏🐛. Start has to be called in an onClick event
//   // // which makes it too awkward for a little demo since you need to load the async data first
//   // source.start(0);

//   // Create gain node and an analyser
//   const gain = context.createGain();
//   const analyser = context.createAnalyser();
//   analyser.fftSize = 64;
//   source.connect(analyser);
//   analyser.connect(gain);

//   // The data array receive the audio frequencies
//   const data = new Uint8Array(analyser.frequencyBinCount);
//   return {
//     context,
//     source,
//     gain,
//     data,
//     // This function gets called every frame per audio source
//     update: () => {
//       analyser.getByteFrequencyData(data);
//       // Calculate a frequency average
//       return (data.avg = data.reduce(
//         (prev, cur) => prev + cur / data.length,
//         0
//       ));
//     },
//   };
// }

// import { suspend } from 'suspend-react';

function HandleAudio(props) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key == 'p') {
        setPlaying(!playing);
        playing ? props.audio.play() : props.audio.pause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playing, props.audio]);
}

// function useAudioData(url) {
//   const [audio] = useState(new Audio(url));
//   const [playing, setPlaying] = useState(false);

//   const toggle = () => setPlaying(!playing);

//   useEffect(() => {
//     playing ? audio.play() : audio.pause();
//   }, [playing, audio]);

//   useEffect(() => {
//     audio.addEventListener('ended', () => setPlaying(false));
//     return () => {
//       audio.removeEventListener('ended', () => setPlaying(false));
//     };
//   }, [audio]);

//   return [playing, toggle];
// }
