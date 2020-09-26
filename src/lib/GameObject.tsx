import * as React from "react";
import { ReactNode, useMemo, useRef, createContext, useContext } from "react";

type RegisterComponent = <T>(name: string, value: T) => void;
type GetComponent = <T>(name: string) => T;

type GameObjectContextValue = {
  addComponent: RegisterComponent;
  getComponent: GetComponent;
};

const GameObjectContext = createContext<GameObjectContextValue>({
  addComponent: () => {
    /* Do nothing */
  },
  getComponent: () => {
    throw new Error("Invalid context");
  },
});

export function GameObject({
  name,
  children,
  ...props
}: {
  name: string;
  children: ReactNode;
  position?: number[];
}) {
  const components = useRef<{ [key: string]: any }>({});

  const value = useMemo<GameObjectContextValue>(
    () => ({
      addComponent<T>(name: string, value: T) {
        components.current[name] = value;
      },
      getComponent(name: string) {
        return components.current[name];
      },
    }),
    []
  );

  return (
    <GameObjectContext.Provider value={value}>
      {children}
    </GameObjectContext.Provider>
  );
}

export function useGameObject() {
  return useContext(GameObjectContext);
}
