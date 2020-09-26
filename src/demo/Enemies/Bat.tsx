import React, { useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Vector2, Vector3 } from "three";

import {
  AnimationPlayer,
  Animations,
  Collider,
  GameObject,
  getDistanceToTarget,
  getVector,
  moveTowards,
  Position,
  PositionApi,
  Sprite,
  useGameObject,
  useSpriteLoader,
  Velocity,
  VelocityApi,
} from "../../lib";
import { CollisionGroups } from "../constants";
import { useGameEntities, useRegisterGameEntity } from "../GameEntities";
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

export function Bat({ name, position, ...props }: any) {
  const texture = useSpriteLoader(enemy, { hFrames: 5, vFrames: 1 });

  return (
    <GameObject name={name}>
      <Position initialPosition={position} />
      <Sprite texture={texture} hFrames={5} />
      <AnimationPlayer animations={enemyAnimations} defaultAnimation="fly" />
      <Collider args={[1, 2, 4]} collisionFilterGroup={CollisionGroups.Enemies}>
        <sprite scale={[3, 3, 3]} center={new Vector2(0.5, 0.5)}>
          <spriteMaterial attach="material" map={texture} transparent />
        </sprite>
      </Collider>
      <Velocity />
      <BasicEnemyScript name={name} />
    </GameObject>
  );
}

export type BasicEnemyOptions = {
  name?: string;
  speed?: number;
  maxSpeed?: number;
  detectionRange?: number;
  acceleration?: number;
  friction?: number;
};

export function useBasicEnemyScript({
  name = "enemy",
  speed = 0.5,
  maxSpeed = 7,
  acceleration = 1.05,
  detectionRange = 10,
  friction = 0.95,
}: BasicEnemyOptions) {
  const gameEntities = useGameEntities();
  const currentSpeed = useRef(speed);
  const gameObject = useGameObject();

  const positionApi = gameObject.getComponent<PositionApi>("position");
  const velocityApi = gameObject.getComponent<VelocityApi>("velocity");

  useRegisterGameEntity({
    name,
    type: "enemy",
    getPosition: () => getVector(positionApi.getPosition()),
  });

  useFrame(() => {
    const player = gameEntities.getEntity("player");
    if (!player) {
      return;
    }

    const position = positionApi.getPosition();
    const playerPosition = player.getPosition();
    const distance = getDistanceToTarget(position, playerPosition);

    if (distance > detectionRange || distance < 3) {
      // The enemy should not stop abruptly, we need to apply some friction
      const currentVelocity = velocityApi.getVelocity();
      currentVelocity.multiplyScalar(friction);
      velocityApi.setVelocity(
        new Vector3(currentVelocity.x, currentVelocity.y, 0)
      );
      currentSpeed.current = 0;
    } else {
      const newVelocity = moveTowards(
        position,
        playerPosition,
        Math.min(currentSpeed.current, maxSpeed)
      );

      velocityApi.setVelocity(newVelocity);

      if (currentSpeed.current < maxSpeed) {
        currentSpeed.current = Math.abs(
          (currentSpeed.current || speed) * acceleration
        );
      }
    }
  });
}

export function BasicEnemyScript(props: BasicEnemyOptions) {
  useBasicEnemyScript(props);
  return null;
}
