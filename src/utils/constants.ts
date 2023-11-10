export enum MASK_TYPES {
  JANGO = "jango",
  VADER = "vader",
}

export const MASKS: Record<
  MASK_TYPES,
  { src: string; widthMultipy: number; offsetX: number; label: string }
> = {
  [MASK_TYPES.JANGO]: {
    src: "./JangoFett.png",
    widthMultipy: 4,
    offsetX: 0.1,
    label: "Jango Fett",
  },
  [MASK_TYPES.VADER]: {
    src: "./vader.png",
    widthMultipy: 4,
    offsetX: 0,
    label: "Darth Vader",
  },
};

export enum TENSORFLOW_BACKENDS {
  CPU = "cpu",
  WEBGL = "webgl",
  WEBGPU = "webgpu",
}

export const TENSORFLOW_BACKEND_LABELS: Record<TENSORFLOW_BACKENDS, string> = {
  [TENSORFLOW_BACKENDS.CPU]: "CPU",
  [TENSORFLOW_BACKENDS.WEBGL]: "WebGL",
  [TENSORFLOW_BACKENDS.WEBGPU]: "WebGPU",
};
