import * as React from "react";
import { useMemo, useRef } from "react";
import { Vector3 } from "three";
import { Api } from "use-cannon";
import { useFrame } from "react-three-fiber";
import { PositionApi, Coordinates, getDirectionToTarget } from "./Position";
import { useGameObject } from "./GameObject";

export type VelocityApi = {
  getVelocity(): Vector3;
  setVelocity(velocity: Vector3): void;
};

export type VelocityOptions = {
  positionApi: PositionApi;
  colliderApi: Api[1];
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
  colliderApi,
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
    colliderApi.velocity.set(
      velocity.current.x,
      velocity.current.y,
      velocity.current.z
    );
  });

  React.useEffect(() => {
    const unsubscribe = colliderApi.position.subscribe((newPosition) => {
      if (!positionApi) {
        return;
      }

      positionApi.setPosition(newPosition as Coordinates);
    });

    return unsubscribe;
  });

  return api;
};

export type VelocityProps = {
  name?: string;
  positionName?: string;
  colliderName?: string;
};

export function Velocity({
  name = "velocity",
  positionName = "position",
  colliderName = "collider",
  ...props
}: VelocityProps) {
  const gameObject = useGameObject();
  const positionApi = gameObject.getComponent<PositionApi>(positionName);
  const colliderApi = gameObject.getComponent<Api[1]>(colliderName);
  const api = useVelocity({ positionApi, colliderApi, ...props });
  useGameObject().addComponent(name, api);

  return null;
}
