import { useMemo, useRef } from "react";
import { Vector3 } from "three";
import { useFrame } from "react-three-fiber";
import { Coordinates } from "./types";
import { getDirectionToTarget } from "./utils";
import { useGameObject } from "./GameObject";
import { ColliderApi } from "./Collider";

export type VelocityApi = {
  getVelocity(): Vector3;
  setVelocity(velocity: Vector3): void;
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

export type VelocityOptions = {
  name?: string;
  colliderName?: string;
};

export const useVelocity = ({
  name = "velocity",
  colliderName = "collider",
}: VelocityOptions): VelocityApi => {
  const gameObject = useGameObject();
  const colliderApi = gameObject.getComponent<ColliderApi>(colliderName);

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

  useFrame((_, delta) => {
    colliderApi.velocity.set(
      velocity.current.x * delta,
      velocity.current.y * delta,
      velocity.current.z * delta
    );
  });

  gameObject.addComponent(name, api);
  return api;
};

export function Velocity(props: VelocityOptions) {
  useVelocity(props);
  return null;
}
