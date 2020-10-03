import * as React from "react";
import {
  ReactNode,
  useMemo,
  useRef,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useFrame } from "react-three-fiber";
import { Object3D } from "three";
import { Entity, useRegisterGameEntity } from "./GameEntities";
import { useScene } from "./Scene";
import { Coordinates } from "./types";
import { getVector } from "./utils";

type RegisterComponent = <T>(name: string, value: T) => void;
type GetComponent = <T>(name: string) => T;

export interface GameObjectContextValue extends Entity {
  addComponent: RegisterComponent;
  getComponent: GetComponent;
  setPosition(velocity: Coordinates): void;
  setDisabled(disabled: boolean): void;
  setDirection(direction: Coordinates): void;
}

const GameObjectContext = createContext<GameObjectContextValue>({
  name: "",
  type: "",
  addComponent: () => {
    /* Do nothing */
  },
  getComponent: () => {
    throw new Error("Invalid context");
  },
  getDirection: () => {
    throw new Error("Invalid context");
  },
  setDirection: () => {
    /* Do nothing */
  },
  getPosition: () => {
    throw new Error("Invalid context");
  },
  setPosition: () => {
    /* Do nothing */
  },
  getDisabled: () => {
    throw new Error("Invalid context");
  },
  setDisabled: () => {
    /* Do nothing */
  },
});

export function GameObject({
  name,
  type,
  children,
  position: initialPosition = [0, 0, 0],
  ...props
}: {
  name: string;
  type: string;
  children: ReactNode;
  position?: Coordinates;
}) {
  const components = useRef<{ [key: string]: any }>({});
  const position = useRef(initialPosition);
  const direction = useRef<Coordinates>([0, 0, 0]);
  const ref = useRef<Object3D>();
  const [disabled, setDisabled] = useState(false);
  const scene = useScene();

  const value = useMemo<GameObjectContextValue>(
    () => ({
      name,
      type,
      addComponent<T>(name: string, value: T) {
        components.current[name] = value;
      },
      getComponent(name: string) {
        return components.current[name];
      },
      getDirection: () => direction.current,
      setDirection: (newDirection) => {
        direction.current = newDirection;
      },
      getPosition: () => position.current,
      setPosition: (newPosition) => {
        position.current = newPosition;
      },
      getDisabled: () => disabled,
      setDisabled: (value: boolean) => setDisabled(value),
    }),
    [disabled, name, type]
  );

  useEffect(() => {
    scene.addGameObject(value);

    return () => scene.removeGameObject(name);
  }, []);

  useFrame(() => {
    if (!ref.current) {
      return;
    }
    ref.current.position.copy(getVector(position.current));
  });

  useRegisterGameEntity(value);

  return (
    <GameObjectContext.Provider value={value}>
      <group ref={ref} position={position.current}>
        {!disabled && children}
      </group>
    </GameObjectContext.Provider>
  );
}

export function useGameObject() {
  return useContext(GameObjectContext);
}
