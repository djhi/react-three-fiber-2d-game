import * as React from "react";
import {
  ReactNode,
  useMemo,
  useRef,
  createContext,
  useContext,
  useState,
} from "react";
import { useFrame } from "react-three-fiber";
import { Object3D } from "three";
import { Entity, useRegisterGameEntity } from "./GameEntities";
import { Coordinates } from "./types";
import { getVector } from "./utils";

type RegisterComponent = <T>(name: string, value: T) => void;
type GetComponent = <T>(name: string) => T;

interface GameObjectContextValue extends Entity {
  addComponent: RegisterComponent;
  getComponent: GetComponent;
  setPosition(velocity: Coordinates): void;
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
  getPosition: () => {
    throw new Error("Invalid context");
  },
  setPosition: () => {
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
  const ref = useRef<Object3D>();

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
      getPosition: () => position.current,
      setPosition: (newPosition) => {
        position.current = newPosition;
      },
    }),
    []
  );

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
        {children}
      </group>
    </GameObjectContext.Provider>
  );
}

export function useGameObject() {
  return useContext(GameObjectContext);
}
