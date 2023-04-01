import { Container } from "pixi.js";
import Entity from "../prefabs/Entity";

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
export function getDirection(
  entity: {
    x: number;
    y: number;
  },
  targetEntity: {
    x: number;
    y: number;
  }
) {
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

export function removeIfDestroyed(array: Container[]) {
  for (const value of [...array]) {
    if (value.destroyed) {
      array.splice(array.indexOf(value), 1);
    }
  }
}

export function getClosestTarget(
  fromEntity: Container,
  availableTargets: Entity[]
) {
  let minDist = Number.MAX_SAFE_INTEGER;
  let newTarget = null;
  for (const entity of availableTargets) {
    const newDist = getEntityDistance(fromEntity, entity);
    if (minDist >= newDist) {
      minDist = newDist;
      newTarget = entity;
    }
  }
  return newTarget;
}
