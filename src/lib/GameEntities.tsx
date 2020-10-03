import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Coordinates } from "./types";

export type Entity = {
  name: string;
  type: string;
  getPosition(): Coordinates;
  getDirection(): Coordinates;
  getDisabled(): boolean;
};

export type GameEntitiesContextValue = {
  addEntity<T extends Entity>(entity: T): void;
  getEntity<T extends Entity>(name: string): T | null;
  removeEntity(name: string): void;
  getEntities<T extends Entity>(type: string): Record<string, T>;
};

export const GameEntitiesContext = createContext<GameEntitiesContextValue>({
  addEntity: (entity) => {},
  getEntity: (name) => {
    return null;
  },
  removeEntity: (name) => {},
  getEntities: () => ({}),
});

export function GameEntitiesProvider({ children }: { children: ReactNode }) {
  const entitiesList = useRef<Entity[]>([]);
  const entitiesMap = useRef<Record<string, Entity>>({});

  // Provide an API to register entities just like scripts
  // Entities can provide an API so that other entities may call actions (die, etc) on them or read properties (position, etc)
  const value = useMemo<GameEntitiesContextValue>(
    () => ({
      addEntity(entity) {
        entitiesList.current.push(entity);
        entitiesMap.current[entity.name] = entity;
      },
      getEntity(name) {
        return entitiesMap.current[name];
      },
      removeEntity(name) {
        entitiesList.current = entitiesList.current.filter(
          (entity) => entity.name !== name
        );
      },
      getEntities(type) {
        return entitiesList.current.filter((entity) => entity.type === type);
      },
    }),
    []
  );

  return (
    <GameEntitiesContext.Provider value={value}>
      {children}
    </GameEntitiesContext.Provider>
  );
}

export function useGameEntities() {
  return useContext(GameEntitiesContext);
}

export function useRegisterGameEntity<T extends Entity>(entity: T) {
  const gameEntities = useGameEntities();
  useEffect(() => {
    gameEntities.addEntity(entity);

    return () => {
      gameEntities.removeEntity(entity.name);
    };
  });
}
