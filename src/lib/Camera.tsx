import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "react-three-fiber";
import { OrthographicCamera } from "drei";
import { Vector3 } from "three";
import {
  Coordinates,
  getDirectionToTarget,
  getDistanceToTarget,
  PositionApi,
} from "./Position";

export type UseCameraFollowApi = {
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  set: (enabled: boolean) => void;
};

export function useCameraFollow({
  initalFollowEnabled = true,
  positionApi,
  threshold = 5,
  speed = 15,
}: {
  initalFollowEnabled?: boolean;
  positionApi: PositionApi;
  threshold?: number;
  speed?: number;
}): UseCameraFollowApi {
  const followEnabled = useRef(initalFollowEnabled);
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!followEnabled) {
      return;
    }
    const targetPosition = positionApi.getPosition();
    const distance = getDistanceToTarget(camera.position, targetPosition);
    const direction = getDirectionToTarget(camera.position, targetPosition);

    direction.z = 0;
    if (distance < threshold) {
      return;
    }

    camera.translateOnAxis(direction, speed * delta);
  });

  const api = useMemo<UseCameraFollowApi>(
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

  return api;
}

export function Camera({ position = [0, 0, 10] }: { position?: Coordinates }) {
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
      zoom={20}
    >
      {null}
    </OrthographicCamera>
  );
}
