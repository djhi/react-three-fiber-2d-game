import React, { useEffect, useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Vector2, Vector3 } from "three";

import {
  AnimationPlayer,
  AnimationPlayerApi,
  CameraFollow,
  Collider,
  ColliderApi,
  GameObject,
  GameObjectApi,
  Inputs,
  InputsApi,
  Movable,
  MovableApi,
  Sprite,
  useGameObject,
  useSpriteLoader,
} from "../../lib";
import { CollisionGroups } from "../constants";
import { playerAnimationsMap } from "./spriteData";
import player from "./Player.png";
import { EnemyDeathEffectApi } from "../Effects/EnemyDeathEffect";
import { useScene } from "../../lib/Scene";
import { getDirectionToTarget } from "../../lib/utils";

const center = new Vector2(0.5, 0.5);
export function Player({ name = "player", position, ...props }: any) {
  const texture = useSpriteLoader(player, { hFrames: 60, vFrames: 1 });

  return (
    <GameObject name={name} type="player" position={position}>
      <Sprite texture={texture} hFrames={60} />
      <AnimationPlayer animations={playerAnimationsMap} />
      <Inputs />
      <Collider
        args={[0.1, 0.1, 0.1]}
        collisionFilterGroup={CollisionGroups.Player}
        collisionFilterMask={CollisionGroups.World | CollisionGroups.Enemies}
        mass={5}
        linearDamping={0.9}
      >
        <sprite name={name} center={center}>
          <spriteMaterial map={texture} transparent />
        </sprite>
      </Collider>
      <Movable maxSpeed={90} />
      <CameraFollow />
      <PlayerScript />
    </GameObject>
  );
}

export type PlayerScriptOptions = {
  rollSpeed?: number;
};

export const usePlayerScript = ({ rollSpeed = 150 }: PlayerScriptOptions) => {
  const state = useRef<"move" | "attack" | "roll">("move");
  const lastDirection = useRef<Vector3>(new Vector3(1, 0, 0));
  const lastInputVector = useRef<Vector3>(new Vector3(0, 0, 0));
  const gameObject = useGameObject();

  const inputsApi = gameObject.getComponent<InputsApi>("inputs");
  const movableApi = gameObject.getComponent<MovableApi>("movable");
  const animationPlayerApi = gameObject.getComponent<AnimationPlayerApi>(
    "animationPlayer"
  );

  const scene = useScene();

  useEffect(() => {
    const colliderApi = gameObject.getComponent<ColliderApi>("collider");
    const handleCollision = (event: any) => {
      const eventGameObject = scene.getGameObject(
        event.body.name
      ) as GameObjectApi;

      if (eventGameObject && eventGameObject.type === "enemy") {
        const enemyDirection = getDirectionToTarget(
          gameObject.getPosition(),
          eventGameObject.getPosition()
        );

        if (
          areDirectionsFacing(lastDirection.current, enemyDirection) &&
          state.current === "attack"
        ) {
          const enemyDeathEffectApi = eventGameObject.getComponent<
            EnemyDeathEffectApi
          >("enemyDeathEffect");
          enemyDeathEffectApi.enable(() => {
            if (!colliderApi.ref?.current) {
              return;
            }
            eventGameObject.setDisabled(true);
          });
        }
      }
    };

    colliderApi.addEventListener("collide", handleCollision);

    return () => {
      colliderApi.removeEventListener("collide", handleCollision);
    };
  }, [scene, gameObject]);

  useFrame(() => {
    switch (state.current) {
      case "move": {
        lastInputVector.current.set(
          inputsApi.getActionStrength("right") -
            inputsApi.getActionStrength("left"),
          inputsApi.getActionStrength("up") -
            inputsApi.getActionStrength("down"),
          0
        );

        if (
          lastInputVector.current.x !== 0 ||
          lastInputVector.current.y !== 0
        ) {
          // Ensure that if the player is moving up and left/right
          // the left/right animation take precedence
          if (
            lastInputVector.current.y > 0 &&
            lastInputVector.current.x === 0
          ) {
            lastDirection.current.set(0, 1, 0);
            animationPlayerApi.setAnimation("move.up");
          }
          // Ensure that if the player is moving down and left/right
          // the left/right animation take precedence
          if (
            lastInputVector.current.y < 0 &&
            lastInputVector.current.x === 0
          ) {
            lastDirection.current.set(0, -1, 0);
            animationPlayerApi.setAnimation("move.down");
          }
          if (lastInputVector.current.x > 0) {
            lastDirection.current.set(1, lastInputVector.current.y, 0);
            animationPlayerApi.setAnimation("move.right");
          }
          if (lastInputVector.current.x < 0) {
            lastDirection.current.set(-1, lastInputVector.current.y, 0);
            animationPlayerApi.setAnimation("move.left");
          }

          movableApi.accelerateTo(lastDirection.current);
        } else {
          movableApi.decelerateTo(lastDirection.current);

          if (lastDirection.current.y > 0) {
            animationPlayerApi.setAnimation("idle.up");
          }
          if (lastDirection.current.y < 0) {
            animationPlayerApi.setAnimation("idle.down");
          }
          if (lastDirection.current.x > 0) {
            animationPlayerApi.setAnimation("idle.right");
          }
          if (lastDirection.current.x < 0) {
            animationPlayerApi.setAnimation("idle.left");
          }
        }

        if (inputsApi.isActionPressed("attack")) {
          state.current = "attack";
        }
        if (inputsApi.isActionPressed("roll")) {
          state.current = "roll";
        }
        break;
      }
      case "attack": {
        if (animationPlayerApi.getAnimation()?.includes("attack")) {
          return;
        }

        movableApi.decelerateTo(lastDirection.current);

        const handleAttackEnded = () => {
          state.current = "move";
        };

        if (lastDirection.current.y > 0) {
          animationPlayerApi.setAnimation("attack.up", handleAttackEnded);
        }
        if (lastDirection.current.y < 0) {
          animationPlayerApi.setAnimation("attack.down", handleAttackEnded);
        }
        if (lastDirection.current.x > 0) {
          animationPlayerApi.setAnimation("attack.right", handleAttackEnded);
        }
        if (lastDirection.current.x < 0) {
          animationPlayerApi.setAnimation("attack.left", handleAttackEnded);
        }
        break;
      }
      case "roll": {
        if (animationPlayerApi.getAnimation()?.includes("roll")) {
          return;
        }

        movableApi.moveTo(lastDirection.current, rollSpeed);

        const handleRollEnded = () => {
          state.current = "move";
        };

        if (lastDirection.current.y > 0) {
          animationPlayerApi.setAnimation("roll.up", handleRollEnded);
          return;
        }
        if (lastDirection.current.y < 0) {
          animationPlayerApi.setAnimation("roll.down", handleRollEnded);
          return;
        }
        if (lastDirection.current.x > 0) {
          animationPlayerApi.setAnimation("roll.right", handleRollEnded);
          return;
        }
        if (lastDirection.current.x < 0) {
          animationPlayerApi.setAnimation("roll.left", handleRollEnded);
          return;
        }

        break;
      }
    }
  });
};

export function PlayerScript(props: PlayerScriptOptions) {
  usePlayerScript(props);
  return null;
}

export const areDirectionsFacing = (
  direction1: Vector3,
  direction2: Vector3
): boolean => {
  if (
    (direction1.x > 0 && direction2.x > 0) ||
    (direction1.x < 0 && direction2.x < 0)
  ) {
    return true;
  }

  if (
    (direction1.y > 0 && direction2.y > 0) ||
    (direction1.y < 0 && direction2.y < 0)
  ) {
    return true;
  }

  return false;
};
