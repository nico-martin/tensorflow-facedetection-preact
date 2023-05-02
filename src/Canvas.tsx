import { FunctionComponent as FC } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { Face, FaceDetector } from "@tensorflow-models/face-detection";
import { DRAW_TYPE, INPUT_TYPE } from "./App";
import styles from "./Canvas.module.css";

const glassesImg: HTMLImageElement = new Image();
glassesImg.src = "./glasses.png";

const Canvas: FC<{
  image: ImageBitmap;
  stream: MediaStream;
  detector: FaceDetector;
  drawType: DRAW_TYPE;
  className?: string;
  inputType: INPUT_TYPE;
}> = ({ image, stream, detector, drawType, className = "", inputType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSetUp, setVideoSetUp] = useState<boolean>(false);

  const setUpStream = () => {
    if (
      !canvasRef?.current ||
      !videoRef?.current ||
      !stream ||
      inputType !== INPUT_TYPE.WEBCAM ||
      videoSetUp
    ) {
      return;
    }
    const video = videoRef.current;
    video.srcObject = stream;
    video.play();
    setVideoSetUp(true);
    console.log("SETUP");
    readStream();
  };

  const drawEstimations = (estimations: Array<Face> = []) => {
    if (!canvasRef?.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    estimations.map((estimation) => {
      const box = estimation.box;
      const adjustmentUnit = box.width / 100;

      if (drawType === DRAW_TYPE.GLASSES) {
        ctx.drawImage(
          glassesImg,
          box.xMin - adjustmentUnit * 5,
          box.yMin - adjustmentUnit * 25,
          box.width,
          box.height
        );
      } else {
        //ctx.lineWidth = adjustmentUnit * 2;
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#22e624";
        ctx.beginPath();
        ctx.rect(box.xMin, box.yMin, box.width, box.height);
        ctx.stroke();
        ctx.closePath();
      }
    });
  };

  const readStream = async () => {
    if (
      !canvasRef?.current ||
      !videoRef?.current ||
      !stream ||
      inputType !== INPUT_TYPE.WEBCAM
    ) {
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const trackSettings = stream.getTracks()[0].getSettings();
    const [width, height] = [trackSettings.width, trackSettings.height];
    canvas.width = width;
    canvas.height = height;
    video.width = width;
    video.height = height;
    //requestAnimationFrame(readStream);
    if (video.readyState == video.HAVE_ENOUGH_DATA) {
      const estimations = await detector.estimateFaces(videoRef.current);
      drawEstimations(estimations);
    }

    window.setTimeout(() => requestAnimationFrame(readStream), 1);
  };

  const redrawCanvas = async () => {
    const canvas = canvasRef.current;
    const [width, height] = [image.width, image.height];
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    const estimations = await detector.estimateFaces(imageData);
    drawEstimations(estimations);
  };

  useEffect(() => {
    if (!canvasRef?.current) return;
    //redrawCanvas();
  }, [detector, image, drawType]);

  useEffect(() => {
    setUpStream();
  }, [stream, videoRef]);

  return (
    <div>
      <canvas className={className} ref={canvasRef} />
      <video ref={videoRef} className={styles.video} playsInline />
    </div>
  );
};

export default Canvas;
