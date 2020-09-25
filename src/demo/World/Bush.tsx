import React from "react";
import { Vector2, Vector3 } from "three";
import { useBox } from "use-cannon";

import { useSprite, useSpriteLoader } from "../../lib";
import { CollisionGroups } from "../constants";
import { useRegisterGameEntity } from "../GameEntities";
import bush from "./Bush.png";

export function Bush({ name, position, ...props }: any) {
  const texture = useSpriteLoader(bush, { hFrames: 1, vFrames: 1 });
  useRegisterGameEntity({
    name,
    type: "world",
    getPosition: () => new Vector3(position[0], position[1], position[2]),
  });

  useSprite({ texture });

  const [ref] = useBox(() => ({
    type: "Static",
    args: [1, 1, 1],
    collisionFilterGroup: CollisionGroups.World,
    collisionFilterMask: CollisionGroups.Player | CollisionGroups.Enemies,
    position,
    ...props,
  }));

  return (
    <sprite
      name={name}
      ref={ref}
      scale={[4, 4, 4]}
      center={new Vector2(0.5, 0.5)}
    >
      <spriteMaterial attach="material" map={texture} transparent />
    </sprite>
  );
}
