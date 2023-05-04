import { FunctionComponent as FC } from "preact";
import { MASK_TYPES, MASKS } from "./utils/constants";

const Options: FC<{
  className?: string;
  videoSources: Array<MediaDeviceInfo>;
  setCurrentCameraId: (id: string) => void;
  setActiveMask: (mask: MASK_TYPES) => void;
}> = ({ className = "", videoSources, setCurrentCameraId, setActiveMask }) => {
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
              <option value={source.deviceId}>{source.label}</option>
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
          {Object.entries(MASKS).map(([type, mask]) => (
            <option value={type}>{mask.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default Options;
