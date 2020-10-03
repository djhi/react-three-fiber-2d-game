import React from "react";
import { Vector2 } from "three";

import { Collider, GameObject, Sprite, useSpriteLoader } from "../../lib";
import { CollisionGroups } from "../constants";
import bush from "./Bush.png";

const center = new Vector2(0.5, 0.5);
export function Bush({ name, position, ...props }: any) {
  const texture = useSpriteLoader(bush, { hFrames: 1, vFrames: 1 });

  return (
    <GameObject name={name} type="world" position={position}>
      <Sprite texture={texture} />
      <Collider
        type="Static"
        args={[0.4, 0.4, 0.4]}
        collisionFilterGroup={CollisionGroups.World}
        collisionFilterMask={CollisionGroups.Player | CollisionGroups.Enemies}
      >
        <sprite name={name} scale={[0.5, 0.5, 0.5]} center={center}>
          <spriteMaterial map={texture} transparent />
        </sprite>
      </Collider>
    </GameObject>
  );
}
