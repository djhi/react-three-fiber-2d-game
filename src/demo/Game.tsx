import React, { Suspense } from "react";
import { Canvas, CanvasContext } from "react-three-fiber";
import { Physics } from "use-cannon";

import { Background, Camera } from "../lib";
import { GameEntitiesProvider } from "../lib/GameEntities";
import { CollisionGroups } from "./constants";

import grassBackground from "./World/GrassBackground.png";
import { Bush } from "./World/Bush";
import { Player } from "./Player/Player";
import { Bat } from "./Enemies/Bat";
import { WebGLRendererParameters } from "three";
import { Scene } from "../lib/Scene";

const glProps: Partial<WebGLRendererParameters> = {
  antialias: false,
};

function Game() {
  const handleCreated = ({ gl }: CanvasContext) => {
    gl.setSize(320, 180, false);
  };
  return (
    <Canvas
      gl={glProps}
      pixelRatio={320 / 180}
      onCreated={handleCreated}
      noEvents
    >
      <ambientLight />

      <Suspense fallback={null}>
        <GameEntitiesProvider>
          <Physics gravity={[0, 0, 0]}>
            <Camera />
            <Level1 />
          </Physics>
        </GameEntitiesProvider>
      </Suspense>
    </Canvas>
  );
}

const EnemiesCount = 1;
function Level1() {
  return (
    <Scene>
      <Background
        url={grassBackground}
        collisionFilterGroup={CollisionGroups.Ignore}
      />
      <Bush name="bush1" position={[1, 2, 0]} />
      <Bush name="bush2" position={[-1, -2, 0]} />
      <Player position={[0, 0, 0]} />
      <Bat name="bat1" position={[2, 0, 0]} />
      <Bat name="bat2" position={[4, 0, 0]} />
      {/* {Array.from(Array(EnemiesCount).keys()).map((_, index) => {
          const base = 2 + Math.random() * 2;
          const x = Math.random() > 0.5 ? base : -base;
          const y = Math.random() > 0.5 ? base : -base;

          return (
            <Bat
              key={`enemy${index}`}
              name={`enemy${index}`}
              position={[x, y, 0]}
            />
          );
        })} */}
    </Scene>
  );
}

export default Game;
