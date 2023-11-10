import { FC } from "react";
import {
  MASK_TYPES,
  MASKS,
  TENSORFLOW_BACKEND_LABELS,
  TENSORFLOW_BACKENDS,
} from "./utils/constants";

const Options: FC<{
  className?: string;
  videoSources: Array<MediaDeviceInfo>;
  setCurrentCameraId: (id: string) => void;
  setActiveMask: (mask: MASK_TYPES) => void;
  setBackend: (backend: TENSORFLOW_BACKENDS) => void;
}> = ({
  className = "",
  videoSources,
  setCurrentCameraId,
  setActiveMask,
  setBackend,
}) => {
  return (
    <div className={className}>
      {videoSources.length >= 2 && (
        <label>
          Camera:{" "}
          <select
            onChange={(e) =>
              setCurrentCameraId((e.target as HTMLSelectElement).value)
            }
          >
            {videoSources.map((source) => (
              <option value={source.deviceId} key={source.deviceId}>
                {source.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Character:{" "}
        <select
          onChange={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            setActiveMask(
              v === "none" || v === null ? null : (v as MASK_TYPES)
            );
          }}
        >
          <option value="none">None</option>
          {Object.entries(MASKS).map(([type, mask], i) => (
            <option value={type} key={i}>
              {mask.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Backend:{" "}
        <select
          onChange={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            setBackend(v as TENSORFLOW_BACKENDS);
          }}
          // @ts-ignore
          disabled={!Boolean(navigator.gpu)}
        >
          {Object.entries(TENSORFLOW_BACKEND_LABELS).map(([type, label], i) => (
            <option value={type} key={i}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default Options;
