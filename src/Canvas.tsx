import { FC, useEffect, useRef } from "react";
import { Face } from "@tensorflow-models/face-landmarks-detection";
import { MASK_TYPES, MASKS } from "./utils/constants";
import { getAngle } from "./utils/helpers";

const glassesImg: HTMLImageElement = new Image();
glassesImg.src = "./glasses.png";

const CanvasComp: FC<{
  width: number;
  height: number;
  className?: string;
  faces?: Face[];
  activeMask: MASK_TYPES;
}> = ({ width, height, className = "", faces = [], activeMask }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const redrawCanvas = async () => {
    if (!canvasRef?.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    (faces || []).map((face) => {
      const keypoints = face.keypoints;

      if (!activeMask) {
        ctx.fillStyle = "#000000";
        keypoints.map((point) => {
          ctx.fillRect(point.x, point.y, 2, 2);
        });
        return;
      }

      const rightEye = keypoints.filter(
        (point) => point.name === "rightEye"
      )[0];
      const leftEye = keypoints.filter((point) => point.name === "leftEye")[0];
      //ctx.fillStyle = "#000000";
      //ctx.fillRect(leftEye.x, leftEye.y, 4, 4);
      //ctx.fillRect(rightEye.x, rightEye.y, 4, 4);
      const widthBetweenEyes = Math.sqrt(
        Math.pow(leftEye.x - rightEye.x, 2) +
          Math.pow(leftEye.y - rightEye.y, 2)
      );

      const center = {
        x: (leftEye.x - rightEye.x) / 2 + rightEye.x,
        y: (leftEye.y - rightEye.y) / 2 + rightEye.y,
      };

      const mask = MASKS[activeMask];
      const image: HTMLImageElement = new Image();
      image.src = mask.src;

      const x = canvas.width / 2;
      const y = canvas.height / 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(getAngle(rightEye, leftEye));
      ctx.translate(-x, -y);
      const imageWidth = widthBetweenEyes * mask.widthMultipy;
      ctx.drawImage(
        image,
        center.x - imageWidth / 2,
        center.y - imageWidth / 2 - imageWidth * mask.offsetX,
        widthBetweenEyes * mask.widthMultipy,
        widthBetweenEyes * mask.widthMultipy
      );
      ctx.restore();
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [faces]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={width}
      height={height}
    />
  );
};

export default CanvasComp;
