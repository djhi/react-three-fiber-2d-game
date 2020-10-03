import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useRef,
} from "react";
import { Entity } from "./GameEntities";

type SceneApi = {
  addGameObject: (gameObject: Entity) => void;
  getGameObject: (name: string) => Entity | undefined;
  removeGameObject: (name: string) => void;
};
const SceneContext = createContext<SceneApi>({
  addGameObject: (gameObject) => {
    /* Do nothing */
  },
  removeGameObject: () => {},
  getGameObject: () => {
    throw new Error("Invalid context");
  },
});

type SceneProps = { children: ReactNode };

export const Scene = ({ children }: SceneProps): ReactElement => {
  const gameObjectsByName = useRef<Map<string, Entity>>(new Map());

  const api = useMemo<SceneApi>(
    () => ({
      addGameObject: (gameObject) => {
        gameObjectsByName.current.set(gameObject.name, gameObject);
      },
      removeGameObject: (name) => {
        gameObjectsByName.current.delete(name);
      },
      getGameObject: (name) => {
        return gameObjectsByName.current.get(name);
      },
    }),
    []
  );

  return <SceneContext.Provider value={api}>{children}</SceneContext.Provider>;
};

export const useScene = () => useContext(SceneContext);
