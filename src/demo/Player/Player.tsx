import React, { useRef } from "react";
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
  Velocity,
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
      >
        <sprite name={name} center={center}>
          <spriteMaterial map={texture} transparent />
        </sprite>
      </Collider>
      <Velocity />
      <Movable maxSpeed={90} acceleration={1.25} friction={0.8} />
      <CameraFollow />
      <PlayerScript />
    </GameObject>
  );
}

export type PlayerScriptOptions = {
  rollSpeed?: number;
};

export const usePlayerScript = ({ rollSpeed = 120 }: PlayerScriptOptions) => {
  const state = useRef<"move" | "attack" | "roll">("move");
  const lastDirection = useRef<Vector3>(new Vector3(1, 0, 0));
  const lastInputVector = useRef<Vector3>(new Vector3(0, 0, 0));
  const gameObject = useGameObject();

  const inputsApi = gameObject.getComponent<InputsApi>("inputs");
  const movableApi = gameObject.getComponent<MovableApi>("movable");
  const animationPlayerApi = gameObject.getComponent<AnimationPlayerApi>(
    "animationPlayer"
  );

  const colliderApi = gameObject.getComponent<ColliderApi>("collider");
  const scene = useScene();

  const handleCollision = (event: any) => {
    const eventGameObject = scene.getGameObject(
      event.body.name
    ) as GameObjectApi;

    if (eventGameObject && eventGameObject.type === "enemy") {
      const enemyDirection = getDirectionToTarget(
        gameObject.getPosition(),
        eventGameObject.getPosition()
      );

      console.log(eventGameObject);
      if (
        lastDirection.current.equals(enemyDirection) &&
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

  useFrame(() => {
    switch (state.current) {
      case "move": {
        const inputVector = new Vector3(
          inputsApi.getActionStrength("right") -
            inputsApi.getActionStrength("left"),
          inputsApi.getActionStrength("up") -
            inputsApi.getActionStrength("down"),
          0
        ).normalize();

        lastInputVector.current = inputVector;

        if (inputVector.x !== 0 || inputVector.y !== 0) {
          // Ensure that if the player is moving up and left/right
          // the left/right animation take precedence
          if (inputVector.y > 0 && inputVector.x === 0) {
            lastDirection.current = new Vector3(0, 1, 0);
            animationPlayerApi.setAnimation("move.up");
          }
          // Ensure that if the player is moving down and left/right
          // the left/right animation take precedence
          if (inputVector.y < 0 && inputVector.x === 0) {
            lastDirection.current = new Vector3(0, -1, 0);
            animationPlayerApi.setAnimation("move.down");
          }
          if (inputVector.x > 0) {
            lastDirection.current = new Vector3(1, inputVector.y, 0);
            animationPlayerApi.setAnimation("move.right");
          }
          if (inputVector.x < 0) {
            lastDirection.current = new Vector3(-1, inputVector.y, 0);
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

        if (lastDirection.current.y > 0) {
          animationPlayerApi.setAnimation("attack.up", () => {
            state.current = "move";
          });
        }
        if (lastDirection.current.y < 0) {
          animationPlayerApi.setAnimation("attack.down", () => {
            state.current = "move";
          });
        }
        if (lastDirection.current.x > 0) {
          animationPlayerApi.setAnimation("attack.right", () => {
            state.current = "move";
          });
        }
        if (lastDirection.current.x < 0) {
          animationPlayerApi.setAnimation("attack.left", () => {
            state.current = "move";
          });
        }
        break;
      }
      case "roll": {
        if (animationPlayerApi.getAnimation()?.includes("roll")) {
          return;
        }

        movableApi.moveTo(lastDirection.current, rollSpeed);

        if (lastDirection.current.y > 0) {
          animationPlayerApi.setAnimation("roll.up", () => {
            state.current = "move";
          });
          return;
        }
        if (lastDirection.current.y < 0) {
          animationPlayerApi.setAnimation("roll.down", () => {
            state.current = "move";
          });
          return;
        }
        if (lastDirection.current.x > 0) {
          animationPlayerApi.setAnimation("roll.right", () => {
            state.current = "move";
          });
          return;
        }
        if (lastDirection.current.x < 0) {
          animationPlayerApi.setAnimation("roll.left", () => {
            state.current = "move";
          });
          return;
        }

        state.current = "move";
        break;
      }
    }
  });
};

export function PlayerScript(props: PlayerScriptOptions) {
  usePlayerScript(props);
  return null;
}
