import React from "react";
import { useThree } from "react-three-fiber";
import { usePlane } from "use-cannon";
import { Plane } from "drei";

import { useSpriteLoader } from "./useSpriteLoader";

export function Background({
  url,
  ...props
}: {
  url: string;
  [key: string]: any;
}) {
  const { viewport } = useThree();
  const { width, height } = viewport();
  console.log({ width, height });

  const texture = useSpriteLoader(url, { size: 64 });
  const [ref] = usePlane(() => ({
    mass: 0,
    ...props,
  }));

  return (
    // @ts-ignore
    <Plane ref={ref} name="Backgroud" scale={[width / 2, height / 2, 1]}>
      <meshBasicMaterial attach="material" map={texture} />
    </Plane>
  );
}
