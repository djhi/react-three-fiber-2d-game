import React, { useMemo, useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Vector2, Vector3 } from "three";
import { useBox } from "use-cannon";

import {
  AnimationPlayerApi,
  getVector,
  InputsApi,
  useAnimationPlayer,
  useCameraFollow,
  useInputs,
  usePosition,
  useSprite,
  useSpriteLoader,
  useVelocity,
  VelocityApi,
} from "../../lib";
import { CollisionGroups } from "../constants";
import { useRegisterGameEntity } from "../GameEntities";
import { playerAnimationsMap } from "./spriteData";
import player from "./Player.png";

export function Player({ name, position, ...props }: any) {
  const animations = useMemo(() => playerAnimationsMap, []);
  const positionApi = usePosition({ initialPosition: position });
  const texture = useSpriteLoader(player, { hFrames: 60, vFrames: 1 });
  const spriteApi = useSprite({ texture, hFrames: 60 });
  const animationPlayerApi = useAnimationPlayer({ animations, spriteApi });
  const inputsApi = useInputs({});

  const [ref, api] = useBox(() => ({
    type: "Dynamic",
    mass: 1,
    args: [3, 3, 3],
    fixedRotation: true,
    collisionFilterGroup: CollisionGroups.Player,
    position,
    ...props,
    // onCollide: (event) => console.log(event),
  }));

  const velocityApi = useVelocity({ positionApi, meshApi: api });

  usePlayer({
    animationPlayerApi,
    inputsApi,
    velocityApi,
  });

  useRegisterGameEntity({
    name,
    type: "player",
    getPosition: () => getVector(positionApi.getPosition()),
  });

  useCameraFollow({ positionApi });

  return (
    <sprite
      name={name}
      ref={ref}
      scale={[8, 8, 8]}
      center={new Vector2(0.5, 0.5)}
    >
      <spriteMaterial attach="material" map={texture} transparent />
    </sprite>
  );
}

export const usePlayer = ({
  speed = 1,
  maxSpeed = 10,
  rollSpeed = 20,
  acceleration = 1.1,
  friction = 0.95,
  inputsApi,
  velocityApi,
  animationPlayerApi,
}: {
  speed?: number;
  maxSpeed?: number;
  rollSpeed?: number;
  acceleration?: number;
  friction?: number;
  inputsApi: InputsApi;
  velocityApi: VelocityApi;
  animationPlayerApi: AnimationPlayerApi;
}) => {
  const state = useRef<"move" | "attack" | "roll">("move");
  const currentSpeed = useRef(speed);
  const lastDirection = useRef<Vector3>(new Vector3(1, 0, 0));
  const lastInputVector = useRef<Vector3>(new Vector3(0, 0, 0));

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
              (currentSpeed.current || speed) * acceleration
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
