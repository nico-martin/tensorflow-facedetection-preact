import { render } from "preact";
import { useState, useEffect } from "preact/hooks";

import {
  FaceLandmarksDetector,
  createDetector,
  SupportedModels,
  Face,
} from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";

import styles from "./App.module.css";
import useWindowSize from "./utils/useWindowSize";
import { MASK_TYPES } from "./utils/constants";
import Canvas from "./Canvas";
import WebcamVideo from "./WebcamVideo";
import Options from "./Options";

const App = () => {
  const [predictionsRunning, setPredictionsRunning] = useState<boolean>(false);
  const [webcamVideo, setWebcamVideo] = useState<HTMLVideoElement>(null);
  const [estimations, setEstimations] = useState<Array<Face>>(null);
  const [videoSourceSize, setVideoSourceSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [videoScale, setVideoScale] = useState<number>(1);
  const [videoSources, setVideoSources] = useState<Array<MediaDeviceInfo>>([]);
  const [activeMask, setActiveMask] = useState<MASK_TYPES>(null);
  const [currentCameraId, setCurrentCameraId] = useState<string>(null);

  useEffect(() => {
    const windowAspectRatio = windowWidth / windowHeight;
    const videoAspectRatio = videoSourceSize.width / videoSourceSize.height;
    const scale =
      windowAspectRatio >= videoAspectRatio
        ? windowWidth / videoSourceSize.width
        : windowHeight / videoSourceSize.height;
    setVideoScale(isNaN(scale) || !isFinite(scale) ? 1 : scale);
  }, [
    windowWidth,
    windowHeight,
    videoSourceSize.width,
    videoSourceSize.height,
  ]);

  useEffect(() => {
    if (!predictionsRunning && webcamVideo) {
      setPredictionsRunning(true);
      createDetector(SupportedModels.MediaPipeFaceMesh, {
        runtime: "tfjs",
        refineLandmarks: false,
        maxFaces: 1,
      }).then((d) => doPredictions(webcamVideo, d));
    }
  }, [webcamVideo, predictionsRunning]);

  const doPredictions = async (
    video: HTMLVideoElement,
    detector: FaceLandmarksDetector
  ) => {
    try {
      const estimations = await detector.estimateFaces(video);
      setEstimations(estimations);
    } catch (e) {
      console.log(e);
    }
    requestAnimationFrame(() => doPredictions(video, detector));
  };

  return (
    <div className={styles.wrapper}>
      <Options
        videoSources={videoSources}
        setCurrentCameraId={setCurrentCameraId}
        setActiveMask={setActiveMask}
        className={styles.options}
      />
      <div className={styles.window}>
        <div
          className={styles.artboard}
          style={{
            color: "black",
            transform: `translateX(-50%) translateY(-50%) scale(${videoScale})`,
          }}
        >
          <WebcamVideo
            className={styles.video}
            width={videoSourceSize.width}
            height={videoSourceSize.height}
            constraints={{
              audio: false,
              video: {
                facingMode: "user",
              },
            }}
            setVideoSourceSize={setVideoSourceSize}
            setVideoSources={setVideoSources}
            currentCameraId={currentCameraId}
            setCurrentCameraId={setCurrentCameraId}
            setWebcamVideo={setWebcamVideo}
          />
          <Canvas
            width={videoSourceSize.width}
            height={videoSourceSize.height}
            faces={estimations}
            className={styles.canvas}
            activeMask={activeMask}
          />
        </div>
      </div>
      <footer className={styles.footer}>
        Created by{" "}
        <a href="https://nico.dev" target="_blank">
          Nico Martin
        </a>
        <br />
        Source code on{" "}
        <a
          href="https://github.com/nico-martin/tensorflow-facedetection-preact"
          target="_blank"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
};

const app: HTMLDivElement = document.querySelector("#app") || null;
app && render(<App />, app);
