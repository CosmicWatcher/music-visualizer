import { Suspense, useEffect, useRef, useState } from "react";
import { geometry } from "maath";
import "./App.css";
import { FFTSIZE, SAMPLERATE, SCENES } from "./config";

import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import {
  CameraControls,
  Effects,
  PerformanceMonitor,
  Stats,
  StatsGl,
  shaderMaterial,
  usePerformanceMonitor,
} from "@react-three/drei";

import { UnrealBloomPass } from "three-stdlib";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import SceneSpaceMagic from "./scenes/SceneSpaceMagic";
import SceneSandbox from "./scenes/SceneSandbox";
import SceneFlatShader from "./scenes/SceneFlatShader";
import loadingFrag from "./shaders/loadingMaterial.frag";

extend(geometry);
extend({ UnrealBloomPass, OutputPass });

export default function App() {
  // const [audio] = useState(new Audio());
  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const analyserRef = useRef(null);
  const warningConfirm = useRef(false);
  const [dpr, setDpr] = useState(1);
  const [currentScene, setCurrentPage] = useState(SCENES.SANDBOX);

  // Handler function that changes the current page
  function switchPage(page) {
    setCurrentPage(page);
  }

  function setupAudio(url) {
    // audio = new Audio();
    audioRef.current.src = url;
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

    let sampleAudio = {
      "Play sample audio": function () {
        if (audioRef.current == null)
          audioRef.current = document.getElementById("audio");

        if (import.meta.env.PROD) {
          if (
            !warningConfirm.current &&
            confirm(
              "WARNING!\nThese visuals can contain bright flashing lights which might cause issues for those with photosensitive epilepsy"
            )
          )
            warningConfirm.current = true;
        } else {
          warningConfirm.current = true;
        }

        if (warningConfirm.current)
          setupAudio(import.meta.env.BASE_URL + "journey.mp3");
      },
    };
    gui.add(sampleAudio, "Play sample audio");

    let yourAudio = {
      "Select your own audio file": function () {
        if (audioRef.current == null)
          audioRef.current = document.getElementById("audio");

        if (import.meta.env.PROD) {
          if (
            !warningConfirm.current &&
            confirm(
              "WARNING!\nThese visuals can contain bright flashing lights which might cause issues for those with photosensitive epilepsy"
            )
          )
            warningConfirm.current = true;
        } else {
          warningConfirm.current = true;
        }

        if (warningConfirm.current) {
          let input = document.createElement("input");
          input.setAttribute("type", "file");
          input.click();
          input.onchange = (e) => {
            setupAudio(URL.createObjectURL(e.target.files[0]));
            // const url = 'http://streaming.tdiradio.com:8000/house.mp3';
          };
        }
      },
    };
    gui.add(yourAudio, "Select your own audio file");

    let obj3 = {
      "Space Magic": function () {
        switchPage(SCENES.SPACE_MAGIC);
      },
      Sandbox: function () {
        switchPage(SCENES.SANDBOX);
      },
      "2D Shader": function () {
        switchPage(SCENES.FLAT_SHADER);
      },
    };
    const sceneFolder = gui.addFolder("Select the scene");
    sceneFolder.add(obj3, "Space Magic");
    sceneFolder.add(obj3, "Sandbox");
    sceneFolder.add(obj3, "2D Shader");
  });

  return (
    <>
      <div id="canvas-container">
        {currentScene == SCENES.SPACE_MAGIC && (
          <Canvas
            dpr={dpr}
            camera={{ fov: 45, position: [0, -1, 11], far: 5000 }}
            gl={{ logarithmicDepthBuffer: true }}
            shadows={"soft"}
          >
            <Suspense fallback={<Loading />}>
              <PerformanceMonitor
                factor={1}
                bounds={(refreshRate) => [30, refreshRate]}
                onChange={({ factor }) =>
                  setDpr(parseFloat((0.2 + 0.8 * factor).toFixed(1)))
                }
              />
              {/* <HandleAudio audio={audio} />  */}
              <SceneSpaceMagic analyser={analyserRef} audio={audioRef} />
              <MyCameraControls />
              <Effects disableGamma>
                <unrealBloomPass
                  threshold={0.05}
                  strength={0.3}
                  radius={0.01}
                />
                <outputPass />
              </Effects>
              <StatsGl className="statsgl" />
              <Stats showPanel={1} className="stats" />
            </Suspense>
          </Canvas>
          // </Suspense>
        )}
        {currentScene == SCENES.SANDBOX && (
          <Canvas
            camera={{ fov: 45, position: [0, -1, 11], far: 5000 }}
            // gl={{ logarithmicDepthBuffer: true }}
            shadows={"soft"}
          >
            <color attach={"background"} args={["#303030"]} />
            <SceneSandbox analyser={analyserRef} audio={audioRef} />
            <MyCameraControls />
            <StatsGl className="statsgl" />
            <Stats showPanel={1} className="stats" />
          </Canvas>
        )}
        {currentScene == SCENES.FLAT_SHADER && (
          <Canvas camera={{ fov: 45, position: [0, 0, 0], far: 10 }}>
            <color attach={"background"} args={["black"]} />
            <SceneFlatShader analyser={analyserRef} audio={audioRef} />
            <StatsGl className="statsgl" />
            <Stats showPanel={1} className="stats" />
          </Canvas>
        )}
      </div>
      <audio id="audio" controls />
    </>
  );
}

const LoadingMaterial = shaderMaterial(
  {
    iTime: 0,
    PI: Math.PI,
    screenRatio: 1,
    pixelSize: 0.01,
  },
  `varying vec2 vUv;
   void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
   }`,
  loadingFrag
);

extend({ LoadingMaterial });

function Loading() {
  const ref = useRef();
  const state = useThree();

  useFrame((state, delta) => {
    ref.current.iTime += delta;
    ref.current.screenRatio = state.viewport.aspect;
    ref.current.pixelSize =
      0.0011 *
      (state.viewport.width <= state.viewport.height
        ? state.viewport.width
        : state.viewport.height);
  });

  return (
    <mesh rotation={[0.0905, 0, 0]}>
      <planeGeometry
        args={[state.viewport.width, state.viewport.height, 1, 1]}
      />
      <loadingMaterial
        key={Loading.key}
        ref={ref}
        toneMapped={false}
        transparent={true}
      />
    </mesh>
  );
}

function MyCameraControls() {
  const cameraControlsRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key == "r") cameraControlsRef.current.reset(true);
      if (e.key == "w") cameraControlsRef.current.forward(10, true);
      if (e.key == "s") cameraControlsRef.current.forward(-10, true);
      if (e.key == "a") cameraControlsRef.current.truck(-10, 0, true);
      if (e.key == "d") cameraControlsRef.current.truck(10, 0, true);
      if (e.key == "Control") cameraControlsRef.current.truck(0, 10, true);
      if (e.key == " ") cameraControlsRef.current.truck(0, -10, true);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
