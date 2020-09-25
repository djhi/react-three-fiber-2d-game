import { useLoader } from "react-three-fiber";
import { RepeatWrapping, TextureLoader } from "three";

type UseSpriteLoaderOptions = {
  hFrames?: number;
  vFrames?: number;
  size?: number;
};

export function useSpriteLoader(
  url: string,
  { hFrames, vFrames, size }: UseSpriteLoaderOptions
) {
  const texture = useLoader(TextureLoader, url);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;

  // eslint-disable-next-line eqeqeq
  if (size != undefined) {
    texture.repeat.set(size, size);
    // eslint-disable-next-line eqeqeq
  } else if (hFrames != undefined && vFrames != undefined) {
    texture.repeat.set(1 / hFrames, 1 / vFrames);
  }

  return texture;
}
