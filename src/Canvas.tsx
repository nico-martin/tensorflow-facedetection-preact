import { FunctionComponent as FC } from "preact";
import { useEffect, useRef } from "preact/hooks";
import {
  Face,
  FaceLandmarksDetector,
} from "@tensorflow-models/face-landmarks-detection";

const glassesImg: HTMLImageElement = new Image();
glassesImg.src = "./glasses.png";

const Canvas: FC<{
  image: ImageBitmap;
  detector: FaceLandmarksDetector;
  className?: string;
}> = ({ image, detector, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawEstimations = (estimations: Array<Face> = []) => {
    if (!canvasRef?.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    estimations.map((estimation) => {
      const box = estimation.box;
      const adjustmentUnit = box.width / 100;
      /*
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#22e624";
      ctx.beginPath();
      ctx.rect(box.xMin, box.yMin, box.width, box.height);
      ctx.stroke();
      ctx.closePath();
       */

      const keypoints = estimation.keypoints;
      keypoints.map((point) => {
        if (point.name) {
          ctx.fillStyle = "#000000";
        } else {
          ctx.fillStyle = "#555555";
        }
        ctx.fillRect(
          point.x,
          point.y,
          adjustmentUnit * 1.5,
          adjustmentUnit * 1.5
        );
      });
    });
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
    console.log(estimations);
    drawEstimations(estimations);
  };

  useEffect(() => {
    if (!canvasRef?.current) return;
    redrawCanvas();
  }, [detector, image]);

  return (
    <div>
      <canvas className={className} ref={canvasRef} />
    </div>
  );
};

export default Canvas;
