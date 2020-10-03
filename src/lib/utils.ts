import { Vector3 } from "three";
import { Coordinates } from "./types";

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
