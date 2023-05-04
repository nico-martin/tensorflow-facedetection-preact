export const getAngle = (
  a: { x: number; y: number },
  b: { x: number; y: number }
): number => {
  const deltaY = b.y - a.y;
  const deltaX = b.x - a.x;
  return Math.atan2(deltaY, deltaX);
};
