import { render, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";

import {
  FaceLandmarksDetector,
  createDetector,
  SupportedModels,
} from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";

import styles from "./App.module.css";
import Input from "./Input";
import Canvas from "./Canvas";

const App = () => {
  const [detector, setDetector] = useState<FaceLandmarksDetector>(null);
  const [activeFile, setActiveFile] = useState<File>(null);

  const [bitmapImage, setBitmapImage] = useState<ImageBitmap>(null);

  useEffect(() => {
    setDetector(null);
    createDetector(SupportedModels.MediaPipeFaceMesh, {
      runtime: "tfjs",
      refineLandmarks: true,
      maxFaces: 3,
    }).then((d) => setDetector(d));
  }, []);

  useEffect(() => {
    setBitmapImage(null);
    if (activeFile) {
      createImageBitmap(activeFile).then((img) => setBitmapImage(img));
    }
  }, [activeFile]);

  return (
    <div className={styles.wrapper}>
      {!detector ? (
        <p className={styles.loading}>loading...</p>
      ) : (
        <Fragment>
          <div className={styles.options}>
            <Input
              className={styles.imageInput}
              onChange={(file) => {
                setActiveFile(file);
              }}
            />
          </div>
          <div className={styles.output}>
            {bitmapImage && (
              <Canvas
                className={styles.canvas}
                image={bitmapImage}
                detector={detector}
              />
            )}
          </div>
        </Fragment>
      )}
    </div>
  );
};

const app: HTMLDivElement = document.querySelector("#app") || null;
app && render(<App />, app);
