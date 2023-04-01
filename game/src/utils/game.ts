import { Container } from "pixi.js";

export function getEntityDirection(entity: Container, targetEntity: Container) {
  const x = targetEntity.x - entity.x;
  const y = targetEntity.y - entity.y;

  const vecSize = Math.sqrt(x * x + y * y);

  const normalizedX = x / vecSize;
  const normalizedY = y / vecSize;

  const angle = Math.atan2(y, x);

  return {
    vec: {
      x: normalizedX,
      y: normalizedY,
    },
    distance: vecSize,
    angle,
  };
}

export function getEntityDistance(entity: Container, targetEntity: Container) {
  const x = targetEntity.x - entity.x;
  const y = targetEntity.y - entity.y;

  return Math.sqrt(x * x + y * y);
}
