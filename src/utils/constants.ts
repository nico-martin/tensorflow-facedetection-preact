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
