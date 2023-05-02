import { FunctionComponent as FC } from "preact";

const Input: FC<{ className?: string; onChange: (file: File) => void }> = ({
  className = "",
  onChange,
}) => {
  return (
    <div className={className}>
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => onChange((e.target as HTMLInputElement).files[0])}
      />
    </div>
  );
};

export default Input;
