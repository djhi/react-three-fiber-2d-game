import { useLoader } from "react-three-fiber";
import {
  ImageLoader,
  LinearMipMapLinearFilter,
  NearestFilter,
  RepeatWrapping,
  RGBAFormat,
  Texture,
} from "three";

type UseSpriteLoaderOptions = {
  hFrames?: number;
  vFrames?: number;
  size?: number;
};

export function useSpriteLoader(
  url: string,
  { hFrames, vFrames, size }: UseSpriteLoaderOptions
) {
  const image = useLoader(ImageLoader, url);
  const texture = new Texture(image);
  texture.format = RGBAFormat;
  texture.needsUpdate = true;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearMipMapLinearFilter;
  texture.magFilter = NearestFilter;

  // eslint-disable-next-line eqeqeq
  if (size != undefined) {
    texture.repeat.set(size, size);
    // eslint-disable-next-line eqeqeq
  } else if (hFrames != undefined && vFrames != undefined) {
    texture.repeat.set(1 / hFrames, 1 / vFrames);
  }

  return texture;
}
