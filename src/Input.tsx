import { FunctionComponent as FC } from "preact";

const Input: FC<{ className?: string; onChange: (file: File) => void }> = ({
  className = "",
  onChange,
}) => (
  <input
    className={className}
    type="file"
    accept="image/png, image/jpeg"
    onChange={(e) => onChange((e.target as HTMLInputElement).files[0])}
  />
);

export default Input;
