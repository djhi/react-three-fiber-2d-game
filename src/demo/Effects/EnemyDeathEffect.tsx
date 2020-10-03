import React, { useMemo, useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Object3D, Vector2 } from "three";
import {
  useAnimationPlayer,
  useSprite,
  useSpriteLoader,
  Animations,
  buildAnimationFromHframes,
  useGameObject,
  AnimationPlayerApi,
} from "../../lib";
import { getVector } from "../../lib/utils";
import enemyDeathEffect from "./EnemyDeathEffect.png";

const animations: Animations = {
  animate: buildAnimationFromHframes(0, 9),
};

const center = new Vector2(0.5, 0.5);

export type EnemyDeathEffectApi = {
  enable: (callback?: EffectEndCallback) => void;
  disable: () => void;
  isEnabled: () => boolean;
};

export type EnemyDeathEffectOptions = {
  animation: string;
  animationPlayer: AnimationPlayerApi;
};

type EffectEndCallback = () => void;

export function useEnemyDeathEffect({
  animation,
  animationPlayer,
}: EnemyDeathEffectOptions): EnemyDeathEffectApi {
  const enabled = useRef(false);
  const callback = useRef<EffectEndCallback | undefined>();

  const api = useMemo<EnemyDeathEffectApi>(
    () => ({
      enable: (newCallback) => {
        enabled.current = true;
        callback.current = newCallback;
      },
      disable: () => {
        enabled.current = false;
      },
      isEnabled: () => enabled.current,
    }),
    []
  );

  useFrame(() => {
    if (enabled.current) {
      animationPlayer.setAnimation(animation, () => {
        if (callback.current) {
          enabled.current = false;
          callback.current();
        }
      });
    }
  });

  return api;
}

export function EnemyDeathEffect({
  name = "enemyDeathEffect",
  animation = "animate",
}: {
  name?: string;
  animation?: string;
}) {
  const gameObject = useGameObject();
  const ref = useRef<Object3D | undefined>();

  const texture = useSpriteLoader(enemyDeathEffect, {
    hFrames: 10,
    vFrames: 1,
  });
  useSprite({ texture, hFrames: 10 });
  const animationPlayer = useAnimationPlayer({
    animations,
  });

  const api = useEnemyDeathEffect({ animation, animationPlayer });
  gameObject.addComponent(name, api);

  useFrame(() => {
    if (!ref.current) {
      return;
    }

    ref.current.visible = api.isEnabled();
    ref.current.position.copy(getVector(gameObject.getPosition()));
  });

  return (
    <sprite
      ref={ref}
      name="enemyDeathEffect"
      center={center}
      position={gameObject.getPosition()}
      scale={[0.5, 0.5, 0.5]}
      visible={false}
    >
      <spriteMaterial map={texture} transparent />
    </sprite>
  );
}
