import React, { useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Vector2, Vector3 } from "three";

import {
  AnimationPlayer,
  AnimationPlayerApi,
  CameraFollow,
  Collider,
  GameObject,
  getVector,
  Inputs,
  InputsApi,
  Position,
  PositionApi,
  Sprite,
  useGameObject,
  useSpriteLoader,
  Velocity,
  VelocityApi,
} from "../../lib";
import { CollisionGroups } from "../constants";
import { useRegisterGameEntity } from "../GameEntities";
import { playerAnimationsMap } from "./spriteData";
import player from "./Player.png";

const center = new Vector2(0.5, 0.5);
export function Player({ name, position, ...props }: any) {
  const texture = useSpriteLoader(player, { hFrames: 60, vFrames: 1 });

  return (
    <GameObject name={name}>
      <Position initialPosition={position} />
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
      <CameraFollow />
      <PlayerScript name={name} />
    </GameObject>
  );
}

export type PlayerScriptOptions = {
  name?: string;
  speed?: number;
  maxSpeed?: number;
  rollSpeed?: number;
  acceleration?: number;
  friction?: number;
};

export const usePlayerScript = ({
  name = "player",
  maxSpeed = 150,
  rollSpeed = 300,
  acceleration = 500,
  friction = 0.8,
}: PlayerScriptOptions) => {
  const state = useRef<"move" | "attack" | "roll">("move");
  const currentSpeed = useRef(1);
  const lastDirection = useRef<Vector3>(new Vector3(1, 0, 0));
  const lastInputVector = useRef<Vector3>(new Vector3(0, 0, 0));
  const gameObject = useGameObject();

  const positionApi = gameObject.getComponent<PositionApi>("position");
  const inputsApi = gameObject.getComponent<InputsApi>("inputs");
  const velocityApi = gameObject.getComponent<VelocityApi>("velocity");
  const animationPlayerApi = gameObject.getComponent<AnimationPlayerApi>(
    "animationPlayer"
  );

  useRegisterGameEntity({
    name,
    type: "player",
    getPosition: () => getVector(positionApi.getPosition()),
  });

  useFrame((_, delta) => {
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

          const newVelocity = new Vector3(
            inputVector.x * Math.min(currentSpeed.current, maxSpeed),
            inputVector.y * Math.min(currentSpeed.current, maxSpeed),
            0
          );
          velocityApi.setVelocity(newVelocity);

          if (currentSpeed.current < maxSpeed) {
            currentSpeed.current = Math.abs(
              (currentSpeed.current || 1) * acceleration
            );
          }
        } else {
          // The player should not stop abruptly, we need to apply some friction
          const currentVelocity = velocityApi.getVelocity();
          currentVelocity.multiplyScalar(friction);
          velocityApi.setVelocity(
            new Vector3(currentVelocity.x, currentVelocity.y, 0)
          );
          currentSpeed.current = 0;

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

        velocityApi.setVelocity(new Vector3(lastInputVector.current.x, 0, 0));
        currentSpeed.current = 0;

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

        const newVelocity = new Vector3(
          lastDirection.current.x * rollSpeed,
          lastDirection.current.y * rollSpeed,
          0
        );
        velocityApi.setVelocity(
          new Vector3(newVelocity.x, newVelocity.y, newVelocity.z)
        );

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
