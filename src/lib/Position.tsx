import { useMemo, useRef } from "react";
import { Vector3 } from "three";

export type PositionUpdatedCallback = (position: number[]) => void;

export type Coordinates = [x: number, y: number, z: number];

export type PositionApi = {
  getPosition(): Coordinates;
  setPosition(velocity: Coordinates): void;
};

export type PositionOptions = {
  initialPosition: Coordinates;
};

export function getVector(coordinatesOrVector: Coordinates | Vector3) {
  const vector = coordinatesOrVector as Vector3;

  if (typeof vector.x !== "undefined") {
    return vector;
  }

  const coordinates = coordinatesOrVector as Coordinates;
  return new Vector3(coordinates[0], coordinates[1], coordinates[2]);
}

export function getDirectionToTarget(
  sourceCoordinates: Coordinates | Vector3,
  targetCoordinates: Coordinates | Vector3
) {
  const sourceVector = getVector(sourceCoordinates);
  const targetVector = getVector(targetCoordinates);

  const direction = new Vector3(0, 0, 0);
  direction.subVectors(targetVector, sourceVector).normalize();
  return direction;
}

export function getDistanceToTarget(
  sourceCoordinates: Coordinates | Vector3,
  targetCoordinates: Coordinates | Vector3
) {
  const sourceVector = getVector(sourceCoordinates);
  const targetVector = getVector(targetCoordinates);

  return sourceVector.distanceTo(targetVector);
}

export const usePosition = ({
  initialPosition,
}: PositionOptions): PositionApi => {
  const position = useRef(initialPosition);

  const api = useMemo<PositionApi>(
    () => ({
      getPosition: () => position.current,
      setPosition: (newPosition) => {
        position.current = newPosition;
      },
    }),
    []
  );

  return api;
};
