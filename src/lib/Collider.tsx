import { cloneElement, ReactElement } from "react";
import { BoxProps, useBox } from "use-cannon";
import { useGameObject } from "./GameObject";
import { PositionApi } from "./Position";

export const useCollider = ({
  type = "Dynamic",
  mass = 1,
  fixedRotation = true,
  ...props
}: BoxProps) => {
  return useBox(() => ({
    type,
    mass,
    fixedRotation: true,
    ...props,
    // onCollide: (event) => console.log(event),
  }));
};

export type ColliderProps = BoxProps & {
  children: ReactElement;
  name?: string;
};

export function Collider({
  name = "collider",
  children,
  ...props
}: ColliderProps) {
  const gameObject = useGameObject();
  const positionApi = gameObject.getComponent<PositionApi>("position");
  const [colliderRef, api] = useCollider({
    position: positionApi.getPosition(),
    ...props,
  });
  useGameObject().addComponent(name, api);
  return cloneElement(children, { ref: colliderRef });
}
