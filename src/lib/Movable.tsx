import { useMemo, useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Vector3 } from "three";
import { useGameObject } from "./GameObject";
import { VelocityApi } from "./Velocity";

export type MovableOptions = {
  acceleration?: number;
  friction?: number;
  maxSpeed?: number;
  velocityApi: VelocityApi;
};

export type MovableApi = {
  accelerateTo(direction: Vector3): void;
  decelerateTo(direction: Vector3): void;
  moveTo(direction: Vector3, speed: number): void;
  stop(): void;
};

type State = "accelerate" | "decelerate" | "move" | "idle";

export const useMovable = ({
  acceleration = 1.25,
  friction = 0.8,
  maxSpeed = 100,
  velocityApi,
}: MovableOptions): MovableApi => {
  const state = useRef<State>("idle");
  const currentSpeed = useRef(50);
  const speedOverride = useRef(false);
  const currentDirection = useRef(new Vector3(0, 0, 0));
  const currentAccelerationTime = useRef(0);
  const accelerationFrequency = 1000 / 15;

  useFrame((_, delta) => {
    if (state.current === "idle") {
      currentAccelerationTime.current = 0;
      return;
    }
    currentAccelerationTime.current += delta * 1000;

    const newVelocity = new Vector3(
      currentDirection.current.x * currentSpeed.current,
      currentDirection.current.y * currentSpeed.current,
      0
    );
    velocityApi.setVelocity(newVelocity);

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

      if (state.current === "decelerate" && currentSpeed.current <= 0) {
        state.current = "idle";
      }
    }
  });

  const api = useMemo<MovableApi>(() => {
    const changeState = (newState: State) => {
      if (state.current !== newState) {
        currentAccelerationTime.current = 0;
        state.current = newState;
        speedOverride.current = newState === "move";
      }
    };
    return {
      accelerateTo: (direction) => {
        currentDirection.current = direction;
        if (state.current !== "accelerate") {
          currentSpeed.current = 25;
        }
        changeState("accelerate");
      },
      decelerateTo: (direction) => {
        currentDirection.current = direction;
        if (state.current !== "idle") {
          changeState("decelerate");
        }
      },
      moveTo: (direction, speed) => {
        currentDirection.current = direction;
        changeState("move");
        currentSpeed.current = speed;
      },
      stop: () => {
        state.current = "idle";
      },
    };
  }, []);

  return api;
};

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(min, value), max);
}

export type MovableProps = Omit<MovableOptions, "velocityApi"> & {
  name?: string;
  velocityName?: string;
};

export function Movable({
  name = "movable",
  velocityName = "velocity",
  ...props
}: MovableProps) {
  const gameObject = useGameObject();
  const velocityApi = gameObject.getComponent<VelocityApi>(velocityName);
  const api = useMovable({ velocityApi, ...props });
  gameObject.addComponent(name, api);
  return null;
}
