import * as React from "react";
import { useMemo, useRef } from "react";
import { Vector3 } from "three";
import { Api } from "use-cannon";
import { useFrame } from "react-three-fiber";
import { PositionApi, Coordinates, getDirectionToTarget } from "./Position";

export type VelocityApi = {
  getVelocity(): Vector3;
  setVelocity(velocity: Vector3): void;
};

export type VelocityOptions = {
  positionApi: PositionApi;
  meshApi: Api[1];
};

export function moveTowards(
  sourceCoordinates: Coordinates | Vector3,
  targetCoordinates: Coordinates | Vector3,
  speed: number
) {
  const direction = getDirectionToTarget(sourceCoordinates, targetCoordinates);

  const velocity = new Vector3(direction.x * speed, direction.y * speed, 0);

  return velocity;
}

export const useVelocity = ({
  positionApi,
  meshApi,
}: VelocityOptions): VelocityApi => {
  const velocity = useRef(new Vector3(0, 0, 0));
  const api = useMemo<VelocityApi>(
    () => ({
      getVelocity: () => velocity.current,
      setVelocity: (newVelocity) => {
        velocity.current = newVelocity;
      },
    }),
    []
  );

  useFrame(() => {
    meshApi.velocity.set(
      velocity.current.x,
      velocity.current.y,
      velocity.current.z
    );
  });

  React.useEffect(() => {
    const unsubscribe = meshApi.position.subscribe((newPosition) => {
      if (!positionApi) {
        return;
      }

      positionApi.setPosition(newPosition as Coordinates);
    });

    return unsubscribe;
  });

  return api;
};
