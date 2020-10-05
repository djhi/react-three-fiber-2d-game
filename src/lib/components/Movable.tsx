import { useMemo, useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Vector3 } from "three";
import { useGameObject } from "../GameObject";
import { ColliderApi } from "./Collider";

export type MovableOptions = {
  acceleration?: number;
  friction?: number;
  maxSpeed?: number;
  name?: string;
  colliderName?: string;
};

export type MovableApi = {
  accelerateTo(direction: Vector3): void;
  decelerateTo(direction: Vector3): void;
  moveTo(direction: Vector3, speed: number): void;
  stop(): void;
};

type State = "accelerate" | "decelerate" | "move" | "idle";

export const useMovable = ({
  acceleration = 1.01,
  friction = -0.9,
  maxSpeed = 3,
  name = "movable",
  colliderName = "collider",
}: MovableOptions): MovableApi => {
  const gameObject = useGameObject();
  const state = useRef<State>("idle");
  const currentSpeed = useRef(1);
  const speedOverride = useRef(false);
  const currentDirection = useRef(new Vector3(0, 0, 0));
  const currentAccelerationTime = useRef(0);
  const accelerationFrequency = 1000 / 5;

  useFrame((_, delta) => {
    const colliderApi = gameObject.getComponent<ColliderApi>(colliderName);
    if (state.current === "idle") {
      currentAccelerationTime.current = 0;
      colliderApi.velocity.set(0, 0, 0);
      return;
    }

    currentAccelerationTime.current += delta * 1000;
    colliderApi.velocity.set(
      currentDirection.current.x * currentSpeed.current,
      currentDirection.current.y * currentSpeed.current,
      0
    );

    if (
      currentAccelerationTime.current > accelerationFrequency &&
      !speedOverride.current
    ) {
      currentAccelerationTime.current -= accelerationFrequency;
      const newSpeed = clamp(
        0,
        currentSpeed.current *
          (state.current === "accelerate" ? acceleration : friction),
        maxSpeed
      );
      currentSpeed.current =
        state.current === "accelerate"
          ? Math.ceil(newSpeed)
          : Math.floor(newSpeed);
    }

    if (state.current === "decelerate" && currentSpeed.current <= 0) {
      state.current = "idle";
    }
  });

  const api = useMemo<MovableApi>(() => {
    const changeState = (newState: State) => {
      if (state.current !== newState) {
        currentAccelerationTime.current = 0;
        state.current = newState;
      }
    };
    return {
      accelerateTo: (direction) => {
        currentDirection.current = direction;
        gameObject.setDirection([direction.x, direction.y, direction.z]);
        if (state.current !== "accelerate" && state.current !== "move") {
          currentSpeed.current = 1;
        }
        changeState("accelerate");
      },
      decelerateTo: (direction) => {
        currentDirection.current = direction;
        gameObject.setDirection([direction.x, direction.y, direction.z]);
        if (state.current !== "idle") {
          changeState("decelerate");
        }
      },
      moveTo: (direction, speed) => {
        currentDirection.current = direction;
        gameObject.setDirection([direction.x, direction.y, direction.z]);
        changeState("move");
        currentSpeed.current = speed;
      },
      stop: () => {
        state.current = "idle";
      },
    };
  }, []);

  gameObject.addComponent(name, api);
  return api;
};

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(min, value), max);
}

export function Movable(props: MovableOptions) {
  useMovable(props);
  return null;
}
