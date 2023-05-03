import { render, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";

import {
  FaceDetector,
  createDetector,
  SupportedModels,
} from "@tensorflow-models/face-detection";
import "@tensorflow/tfjs-backend-webgl";

import styles from "./App.module.css";
import Input from "./Input";
import Canvas from "./Canvas";

export enum DRAW_TYPE {
  RECT = "rect",
  GLASSES = "glases",
}

const App = () => {
  const [detector, setDetector] = useState<FaceDetector>(null);
  const [activeFile, setActiveFile] = useState<File>(null);
  const [draw, setDraw] = useState<DRAW_TYPE>(Object.values(DRAW_TYPE)[0]);

  const [bitmapImage, setBitmapImage] = useState<ImageBitmap>(null);

  useEffect(() => {
    setDetector(null);
    createDetector(SupportedModels.MediaPipeFaceDetector, {
      runtime: "tfjs",
      maxFaces: 5,
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
        <p>loading...</p>
      ) : (
        <Fragment>
          <div className={styles.options}>
            <Input
              className={styles.imageInput}
              onChange={(file) => {
                setActiveFile(file);
              }}
            />
            <label>
              Draw:{" "}
              <select
                onChange={(e) =>
                  setDraw(
                    (e.target as HTMLSelectElement).value === DRAW_TYPE.RECT
                      ? DRAW_TYPE.RECT
                      : DRAW_TYPE.GLASSES
                  )
                }
              >
                {Object.values(DRAW_TYPE).map((v) => (
                  <option>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.output}>
            {bitmapImage && (
              <Canvas
                className={styles.canvas}
                image={bitmapImage}
                detector={detector}
                drawType={draw}
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
