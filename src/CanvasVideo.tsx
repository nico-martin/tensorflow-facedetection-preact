import React from "react";

const CanvasVideo: React.FC<{
  width: number;
  height: number;
  className?: string;
  setWebcamCanvas: (canvas: HTMLCanvasElement) => void;
}> = ({ width, height, setWebcamCanvas }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    ref?.current && setWebcamCanvas(ref.current);
  }, [ref]);

  return <canvas height={height} width={width} ref={ref} />;
};

export default CanvasVideo;
