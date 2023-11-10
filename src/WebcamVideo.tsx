import { FC, useEffect, useRef, useState } from "react";

const initWebcam = async (
  constraints: MediaStreamConstraints = {}
): Promise<Array<MediaDeviceInfo>> => {
  await navigator.mediaDevices.getUserMedia(constraints);
  const deviceInfos = await navigator.mediaDevices.enumerateDevices();
  return deviceInfos.filter((device) => device.kind === "videoinput");
};

const getStream = async (
  constraints: MediaStreamConstraints = {},
  currentCameraId: string
): Promise<MediaStream> => {
  constraints = {
    ...constraints,
    video: {
      ...(typeof constraints?.video === "object" ? constraints.video : {}),
      deviceId: currentCameraId,
    },
  };

  return await navigator.mediaDevices.getUserMedia(constraints);
};

const WebcamVideo: FC<{
  width: number;
  height: number;
  className?: string;
  constraints?: MediaStreamConstraints;
  setVideoSourceSize: ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => void;
  setVideoSources: (sources: Array<MediaDeviceInfo>) => void;
  currentCameraId: string;
  setCurrentCameraId: (id: string) => void;
  setWebcamVideo: (video: HTMLVideoElement | HTMLCanvasElement) => void;
}> = ({
  width,
  height,
  className = "",
  constraints = {},
  setVideoSourceSize,
  setVideoSources,
  currentCameraId,
  setCurrentCameraId,
  setWebcamVideo,
}) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream>(null);

  useEffect(() => {
    if (webcamRef?.current && !initialized) {
      setInitialized(true);
      initWebcam(constraints).then((devices) => {
        setVideoSources(devices);
        setCurrentCameraId(devices[0].deviceId);
        setWebcamVideo(webcamRef.current);
      });
    }
  }, [webcamRef, initialized]);

  useEffect(() => {
    if (currentCameraId && webcamRef?.current) {
      stream && stream.getTracks().forEach((track) => track.stop());
      setStream(null);

      getStream(constraints, currentCameraId).then((mediaStream) => {
        setStream(mediaStream);
        setVideoSourceSize({
          width: mediaStream.getVideoTracks()[0].getSettings().width,
          height: mediaStream.getVideoTracks()[0].getSettings().height,
        });
        const video = webcamRef.current;
        video.srcObject = mediaStream;
        video.play();
      });
    }

    return () => {
      stream && stream.getTracks().forEach((track) => track.stop());
    };
  }, [currentCameraId]);

  return (
    <video
      ref={webcamRef}
      width={width}
      height={height}
      playsInline
      className={className}
    />
  );
};

export default WebcamVideo;
