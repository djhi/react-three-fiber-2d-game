import { cloneElement, MutableRefObject, ReactElement, useEffect } from "react";
import { EventDispatcher, Object3D } from "three";
import { Api, BoxProps, Event, useBox } from "use-cannon";
import { useGameObject } from "./GameObject";
import { Coordinates } from "./types";

export type ColliderOptions = BoxProps & {
  name?: string;
};

export type ColliderApi = Api[1] & {
  ref?: MutableRefObject<Object3D | undefined>;
  addEventListener: (type: string, listener: (event: Event) => void) => void;
  removeEventListener: (type: string, listener: (event: Event) => void) => void;
};

export const useCollider = ({
  name = "collider",
  type = "Dynamic",
  mass = 1,
  fixedRotation = true,
  ...props
}: ColliderOptions): [MutableRefObject<Object3D | undefined>, ColliderApi] => {
  const gameObject = useGameObject();
  const eventDispatcher = new EventDispatcher();
  const [ref, api] = useBox(() => ({
    type,
    mass,
    position: gameObject.getPosition(),
    fixedRotation: true,
    ...props,
    onCollide: (event) => {
      eventDispatcher.dispatchEvent(event);
    },
  }));

  useEffect(
    () =>
      api.position.subscribe((position) => {
        gameObject.setPosition(position as Coordinates);
      }),
    [api.position, gameObject]
  );

  const colliderApi = {
    ref,
    ...api,
    addEventListener: (type, listener) => {
      eventDispatcher.addEventListener(type, listener);
    },
    removeEventListener: (type, listener) => {
      eventDispatcher.removeEventListener(type, listener);
    },
  };

  gameObject.addComponent(name, colliderApi);

  return [ref, colliderApi];
};

export type ColliderProps = ColliderOptions & {
  children: ReactElement;
};

export function Collider({ children, ...props }: ColliderProps) {
  const [re, api] = useCollider(props);
  return cloneElement(children, { ref: api.ref });
}
