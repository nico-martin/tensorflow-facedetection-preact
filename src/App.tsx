import { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import * as tfjs from "@tensorflow/tfjs";
declare const tf: typeof tfjs;

import {
  createDetector,
  Face,
  FaceLandmarksDetector,
  SupportedModels,
} from "@tensorflow-models/face-landmarks-detection";

import styles from "./App.module.css";
import useWindowSize from "./utils/useWindowSize";
import { MASK_TYPES, TENSORFLOW_BACKENDS } from "./utils/constants";
import Canvas from "./Canvas";
import WebcamVideo from "./WebcamVideo";
import Options from "./Options";

const App = () => {
  const [predictionsRunning, setPredictionsRunning] = useState<boolean>(false);
  //const [doPredict, setDoPredict] = useState<boolean>(false);
  const [webcamVideo, setWebcamVideo] = useState<
    HTMLVideoElement | HTMLCanvasElement
  >(null);
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
  const [backend, setBackend] = useState<TENSORFLOW_BACKENDS>(
    TENSORFLOW_BACKENDS.CPU
  );
  const [predictionTimestamps, setPredictionTimestamps] = useState<
    Array<number>
  >([]);

  useEffect(() => {
    console.log("set backend", backend);
    // @ts-ignore
    window.tf.setBackend(backend).then(() => {
      // @ts-ignore
      console.log("backend done", tf.getBackend());
    });
  }, [backend]);

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
      console.log("create detector");
      createDetector(SupportedModels.MediaPipeFaceMesh, {
        runtime: "tfjs",
        refineLandmarks: true,
        maxFaces: 1,
      }).then((d) => doPredictions(webcamVideo, d));
    }
  }, [webcamVideo, predictionsRunning]);

  const timeouts: Array<number> = useMemo(
    () =>
      predictionTimestamps
        .map((timestamp, i) => {
          if (predictionTimestamps[i + 1]) {
            return predictionTimestamps[i + 1] - timestamp;
          }
          return null;
        })
        .filter((e) => e !== null),
    [predictionTimestamps]
  );

  const doPredictions = async (
    video: HTMLVideoElement | HTMLCanvasElement,
    detector: FaceLandmarksDetector
  ) => {
    try {
      const estimations = await detector.estimateFaces(video);
      //console.log("estimations", estimations);
      setEstimations(estimations);
    } catch (e) {
      console.log(e);
    }
    setPredictionTimestamps((timestamps) =>
      [...timestamps, new Date().getTime()].slice(-10)
    );

    requestAnimationFrame(() => doPredictions(video, detector));
  };

  return (
    <div className={styles.wrapper}>
      <Options
        videoSources={videoSources}
        setCurrentCameraId={setCurrentCameraId}
        setActiveMask={setActiveMask}
        className={styles.options}
        setBackend={setBackend}
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
        {timeouts.length >= 0 && (
          <p style={{ textAlign: "right" }}>
            FPS:{" "}
            {Math.round(
              1000 /
                Math.round(
                  timeouts.reduce((acc, value) => acc + value, 0) /
                    timeouts.length
                )
            )}
          </p>
        )}
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

// @ts-ignore
window.tf.setBackend(TENSORFLOW_BACKENDS.WEBGL).then(() => {
  const app = ReactDOM.createRoot(document.querySelector("#app"));
  app && app.render(<App />);
});
