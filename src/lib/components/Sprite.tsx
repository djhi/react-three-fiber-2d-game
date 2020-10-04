import { useMemo, useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Texture } from "three";
import { useGameObject } from "../GameObject";

export type Frame = [number, number];

export type SpriteApi = {
  setFrame: (frame: Frame) => void;
};

export type SpriteOptions = {
  name?: string;
  texture: Texture;
  hFrames?: number;
  vFrames?: number;
  frame?: Frame;
};

export const useSprite = ({
  name = "sprite",
  frame = [0, 0],
  hFrames = 1,
  vFrames = 1,
  texture,
}: SpriteOptions) => {
  const currentFrame = useRef<Frame | undefined>(frame);
  const api = useMemo(
    () => ({
      setFrame: (frame: Frame) => {
        currentFrame.current = frame;
      },
    }),
    []
  );

  useFrame(() => {
    if (!currentFrame.current) {
      return;
    }

    texture.offset.x = currentFrame.current[0] / hFrames;
    texture.offset.y = currentFrame.current[1] / vFrames;
  });

  useGameObject().addComponent(name, api);
  return api;
};

export function Sprite(props: SpriteOptions) {
  useSprite(props);
  return null;
}
