import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "react-three-fiber";
import { OrthographicCamera } from "drei";
import { Vector3 } from "three";
import { Coordinates } from "./types";
import { getDirectionToTarget, getDistanceToTarget } from "./utils";
import { useGameObject } from "./GameObject";

export function Camera({
  position = [0, 0, 10],
  ...props
}: {
  position?: Coordinates;
  [key: string]: any;
}) {
  const { viewport } = useThree();

  return (
    <OrthographicCamera
      makeDefault
      near={0}
      far={1000}
      left={viewport.width / -2}
      top={viewport.height / 2}
      right={viewport.width / 2}
      bottom={viewport.height / -2}
      position={position}
      lookAt={() => new Vector3(0, 0, 0)}
      zoom={150}
      {...props}
    >
      {null}
    </OrthographicCamera>
  );
}

export type CameraFollowApi = {
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  set: (enabled: boolean) => void;
};

export type CameraFollowOptions = {
  initalFollowEnabled?: boolean;
  name?: string;
  threshold?: number;
  speed?: number;
};

export function useCameraFollow({
  name = "cameraFollow",
  initalFollowEnabled = true,
  threshold = 3,
  speed = 30,
}: CameraFollowOptions): CameraFollowApi {
  const gameObject = useGameObject();
  const followEnabled = useRef(initalFollowEnabled);
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!followEnabled) {
      return;
    }
    const targetPosition = gameObject.getPosition();
    const distance = getDistanceToTarget(camera.position, targetPosition);
    const direction = getDirectionToTarget(camera.position, targetPosition);

    direction.z = 0;
    if (distance < threshold) {
      return;
    }

    camera.translateOnAxis(direction, speed * delta);
  });

  const api = useMemo<CameraFollowApi>(
    () => ({
      enable: () => {
        followEnabled.current = true;
      },
      disable: () => {
        followEnabled.current = false;
      },
      toggle: () => {
        followEnabled.current = !followEnabled.current;
      },
      set: (enabled) => {
        followEnabled.current = enabled;
      },
    }),
    []
  );

  gameObject.addComponent(name, api);
  return api;
}

export function CameraFollow(props: CameraFollowOptions) {
  useCameraFollow(props);
  return null;
}
