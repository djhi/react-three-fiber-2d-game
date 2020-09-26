import React from "react";
import { Vector2, Vector3 } from "three";

import {
  Collider,
  GameObject,
  Position,
  Sprite,
  useSpriteLoader,
} from "../../lib";
import { CollisionGroups } from "../constants";
import { useRegisterGameEntity } from "../GameEntities";
import bush from "./Bush.png";

const center = new Vector2(0.5, 0.5);
export function Bush({ name, position, ...props }: any) {
  const texture = useSpriteLoader(bush, { hFrames: 1, vFrames: 1 });
  useRegisterGameEntity({
    name,
    type: "world",
    getPosition: () => new Vector3(position[0], position[1], position[2]),
  });

  return (
    <GameObject name={name}>
      <Position initialPosition={position} />
      <Sprite texture={texture} />
      <Collider
        type="Static"
        args={[0.4, 0.4, 0.4]}
        collisionFilterGroup={CollisionGroups.World}
        collisionFilterMask={CollisionGroups.Player | CollisionGroups.Enemies}
      >
        <sprite scale={[0.5, 0.5, 0.5]} center={center}>
          <spriteMaterial map={texture} transparent />
        </sprite>
      </Collider>
    </GameObject>
  );
}
