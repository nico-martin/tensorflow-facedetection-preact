import { render } from "preact";
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
import Webcam from "./Webcam";
import * as stream from "stream";

export enum INPUT_TYPE {
  WEBCAM = "webcam",
  IMAGE = "image",
}

export enum DRAW_TYPE {
  RECT = "rect",
  GLASSES = "glases",
}

const App = () => {
  const [detector, setDetector] = useState<FaceDetector>(null);
  const [activeFile, setActiveFile] = useState<File>(null);
  const [activeStream, setActiveStream] = useState<MediaStream>(null);
  const [draw, setDraw] = useState<DRAW_TYPE>(Object.values(DRAW_TYPE)[0]);
  const [inputType, setInputType] = useState<INPUT_TYPE>(
    Object.values(INPUT_TYPE)[0]
  );
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
    <div>
      {!detector ? (
        <p>loading...</p>
      ) : (
        <div>
          <select
            onChange={(e) =>
              setInputType(
                (e.target as HTMLSelectElement).value === INPUT_TYPE.WEBCAM
                  ? INPUT_TYPE.WEBCAM
                  : INPUT_TYPE.IMAGE
              )
            }
          >
            {Object.values(INPUT_TYPE).map((v) => (
              <option>{v}</option>
            ))}
          </select>
          {inputType === INPUT_TYPE.WEBCAM && (
            <Webcam
              setStream={(stream) => {
                setActiveStream(stream);
              }}
            />
          )}
          {inputType === INPUT_TYPE.IMAGE && (
            <Input
              onChange={(file) => {
                setActiveFile(file);
              }}
            />
          )}
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
          <br />
          {(bitmapImage || stream) && (
            <Canvas
              className={styles.canvas}
              image={bitmapImage}
              stream={activeStream}
              detector={detector}
              drawType={draw}
              inputType={inputType}
            />
          )}
        </div>
      )}
    </div>
  );
};

const app: HTMLDivElement = document.querySelector("#app") || null;
app && render(<App />, app);
