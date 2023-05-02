import { FunctionComponent as FC } from "preact";
import { useEffect, useState } from "preact/hooks";

enum STATE {
  IDLE = "idle",
  LOADING = "loading",
  STOPPED = "stopped",
  RUNNING = "running",
}

const Webcam: FC<{ setStream: (stream: MediaStream) => void }> = ({
  setStream,
}) => {
  const [state, setState] = useState<STATE>(STATE.IDLE);
  const [stream, setInternalStream] = useState<MediaStream>(null);

  const createStream = async () => {
    setState(STATE.LOADING);
    setInternalStream(null);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: "user", width: 640, height: 480 },
    });
    setState(STATE.RUNNING);
    setInternalStream(stream);
  };

  const stopStream = () => {
    setState(STATE.LOADING);
    stream.getTracks().map((track) => track.stop());
    setInternalStream(null);
    setState(STATE.STOPPED);
  };

  useEffect(() => {
    setStream(stream);
  }, [stream]);

  return (
    <div>
      {state === STATE.LOADING ? (
        "camera loading..."
      ) : state === STATE.RUNNING ? (
        <button onClick={() => stopStream()}>stop camera</button>
      ) : (
        <button onClick={() => createStream()}>start</button>
      )}
    </div>
  );
};

export default Webcam;
