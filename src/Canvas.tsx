import { FunctionComponent as FC } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { Face, FaceDetector } from "@tensorflow-models/face-detection";
import { DRAW_TYPE } from "./App";

const glassesImg: HTMLImageElement = new Image();
glassesImg.src = "./glasses.png";

const Canvas: FC<{
  image: ImageBitmap;
  detector: FaceDetector;
  drawType: DRAW_TYPE;
  className?: string;
}> = ({ image, detector, drawType, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    redrawCanvas();
  }, [detector, image, drawType]);

  return (
    <div>
      <canvas className={className} ref={canvasRef} />
    </div>
  );
};

export default Canvas;
