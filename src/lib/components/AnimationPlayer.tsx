import { useMemo, useRef } from "react";
import { useFrame } from "react-three-fiber";
import { get } from "lodash";

import { Frame, SpriteApi } from "./Sprite";
import { useGameObject } from "../GameObject";

export type AnimationPlayerApi = {
  setAnimation: (path: string, callback?: AnimationEndCallback) => void;
  getAnimation: () => string | undefined;
};

export type Animation = {
  frames: Frame[];
  loop?: boolean;
};

export type Animations = {
  [key: string]: Animations | Animation;
};

type AnimationEndCallback = () => void;

type AnimationPlayerOptions = {
  name?: string;
  spriteName?: string;
  animations: Animations;
  defaultAnimation?: string;
};

export function buildAnimationFromHframes(from: number, to: number): Animation {
  return {
    frames: Array.from(Array(to - from).keys()).map((_, index) => [
      from + index,
      1,
    ]),
  };
}

export const useAnimationPlayer = ({
  name = "animationPlayer",
  spriteName = "sprite",
  animations,
  defaultAnimation,
}: AnimationPlayerOptions): AnimationPlayerApi => {
  const gameObject = useGameObject();
  const spriteApi = gameObject.getComponent<SpriteApi>(spriteName);

  if (spriteApi === null) {
    throw new Error("Invalid sprite for AnimationPlayer");
  }
  const currentAnimation = useRef<string | undefined>(defaultAnimation);
  const currentCallback = useRef<AnimationEndCallback | null>();
  const currentFrameDisplayTime = useRef(0);
  const step = useRef(0);
  const frameDuration = 1000 / 10;

  const api = useMemo<AnimationPlayerApi>(
    () => ({
      setAnimation: (path, callback) => {
        if (currentAnimation.current !== path) {
          currentAnimation.current = path;
          step.current = 0;
        }

        if (callback) {
          currentCallback.current = callback;
        }
      },
      getAnimation: () => {
        return currentAnimation.current;
      },
    }),
    []
  );

  useFrame((_, delta) => {
    if (!currentAnimation.current) {
      return;
    }
    const animation = get(animations, currentAnimation.current) as Animation;

    if (!animation.frames) {
      return;
    }

    currentFrameDisplayTime.current += delta * 1000;
    if (currentFrameDisplayTime.current > frameDuration) {
      currentFrameDisplayTime.current -= frameDuration;

      if (step.current === animation.frames.length - 1) {
        if (animation.loop) {
          step.current = 0;
          return;
        }

        if (currentCallback.current) {
          currentCallback.current();
          currentCallback.current = null;
        }
      } else {
        step.current++;
      }
    }

    spriteApi.setFrame(animation.frames[step.current]);
  });

  gameObject.addComponent(name, api);
  return api;
};

export function AnimationPlayer(props: AnimationPlayerOptions) {
  useAnimationPlayer(props);
  return null;
}
