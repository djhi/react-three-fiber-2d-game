import React, { useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Vector2 } from "three";

import {
  AnimationPlayer,
  Animations,
  Collider,
  ColliderApi,
  GameObject,
  Movable,
  MovableApi,
  Sprite,
  useGameObject,
  useSpriteLoader,
  Velocity,
} from "../../lib";
import { getDirectionToTarget, getDistanceToTarget } from "../../lib/utils";
import { CollisionGroups } from "../constants";
import { useGameEntities } from "../../lib/GameEntities";
import {
  EnemyDeathEffect,
  EnemyDeathEffectApi,
} from "../Effects/EnemyDeathEffect";
import enemy from "./Bat.png";

const enemyAnimations: Animations = {
  fly: {
    frames: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ],
    loop: true,
  },
};

const center = new Vector2(0.5, 0.5);

export function Bat({ name, position, ...props }: any) {
  const texture = useSpriteLoader(enemy, { hFrames: 5, vFrames: 1 });

  return (
    <GameObject name={name} type="enemy" position={position}>
      <Sprite texture={texture} hFrames={5} />
      <AnimationPlayer animations={enemyAnimations} defaultAnimation="fly" />
      <Collider
        args={[0.1, 0.1, 0.1]}
        collisionFilterGroup={CollisionGroups.Enemies}
        collisionFilterMask={
          CollisionGroups.World |
          CollisionGroups.Player |
          CollisionGroups.Enemies
        }
      >
        <sprite name={name} scale={[0.3, 0.3, 0.5]} center={center}>
          <spriteMaterial map={texture} />
        </sprite>
      </Collider>
      <Velocity />
      <Movable maxSpeed={60} acceleration={1.25} friction={0.8} />
      <EnemyDeathEffect />
      <BasicEnemyScript />
    </GameObject>
  );
}

export type BasicEnemyOptions = {
  detectionRange?: number;
};

export function useBasicEnemyScript({
  detectionRange = 1.5,
}: BasicEnemyOptions) {
  const gameEntities = useGameEntities();
  const gameObject = useGameObject();
  const chasing = useRef(false);

  const movableApi = gameObject.getComponent<MovableApi>("movable");

  useFrame(() => {
    const player = gameEntities.getEntity("player");
    if (!player) {
      return;
    }

    const position = gameObject.getPosition();
    const playerPosition = player.getPosition();
    const distance = getDistanceToTarget(position, playerPosition);
    const outOfRange = distance > detectionRange || distance < 1;
    const direction = getDirectionToTarget(position, playerPosition);

    if (outOfRange && chasing.current) {
      movableApi.decelerateTo(direction);
    } else {
      chasing.current = true;
      movableApi.accelerateTo(direction);
    }
  });
}

export function BasicEnemyScript(props: BasicEnemyOptions) {
  useBasicEnemyScript(props);
  return null;
}
