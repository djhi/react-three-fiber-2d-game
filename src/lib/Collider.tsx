import { cloneElement, ReactElement, useEffect } from "react";
import { Api, BoxProps, useBox } from "use-cannon";
import { useGameObject } from "./GameObject";
import { Coordinates } from "./types";

export type ColliderOptions = BoxProps & {
  name?: string;
};

export type ColliderApi = Api[1];

export const useCollider = ({
  name = "collider",
  type = "Dynamic",
  mass = 1,
  fixedRotation = true,
  ...props
}: ColliderOptions) => {
  const gameObject = useGameObject();
  const [ref, api] = useBox(() => ({
    type,
    mass,
    position: gameObject.getPosition(),
    fixedRotation: true,
    ...props,
    // onCollide: (event) => console.log(event),
  }));

  useEffect(() =>
    api.position.subscribe((position) => {
      gameObject.setPosition(position as Coordinates);
    })
  );
  gameObject.addComponent(name, api);

  return [ref, api];
};

export type ColliderProps = ColliderOptions & {
  children: ReactElement;
};

export function Collider({ children, ...props }: ColliderProps) {
  const [colliderRef] = useCollider(props);
  return cloneElement(children, { ref: colliderRef });
}
