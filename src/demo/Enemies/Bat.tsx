import React, { useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Vector2, Vector3 } from "three";
import { useBox } from "use-cannon";

import {
  Animations,
  getDistanceToTarget,
  getVector,
  moveTowards,
  PositionApi,
  useAnimationPlayer,
  usePosition,
  useSprite,
  useSpriteLoader,
  useVelocity,
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
  const positionApi = usePosition({ initialPosition: position });
  const texture = useSpriteLoader(enemy, { hFrames: 5, vFrames: 1 });
  const spriteApi = useSprite({ texture, hFrames: 5 });
  useAnimationPlayer({
    animations: enemyAnimations,
    spriteApi,
    defaultAnimation: "fly",
  });

  const [ref, api] = useBox(() => ({
    type: "Dynamic",
    mass: 1,
    args: [1, 2, 4],
    fixedRotation: true,
    collisionFilterGroup: CollisionGroups.Enemies,
    position,
    ...props,
  }));

  const velocityApi = useVelocity({ positionApi, meshApi: api });

  useRegisterGameEntity({
    name,
    type: "enemy",
    getPosition: () => getVector(positionApi.getPosition()),
  });
  useBasicEnemy({
    positionApi,
    velocityApi,
  });

  return (
    <sprite
      name={name}
      ref={ref}
      scale={[3, 3, 3]}
      center={new Vector2(0.5, 0.5)}
    >
      <spriteMaterial attach="material" map={texture} transparent />
    </sprite>
  );
}

export function useBasicEnemy({
  speed = 0.5,
  maxSpeed = 7,
  acceleration = 1.05,
  detectionRange = 10,
  friction = 0.95,
  positionApi,
  velocityApi,
}: {
  speed?: number;
  maxSpeed?: number;
  detectionRange?: number;
  acceleration?: number;
  friction?: number;
  positionApi: PositionApi;
  velocityApi: VelocityApi;
}) {
  const gameEntities = useGameEntities();
  const currentSpeed = useRef(speed);

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
