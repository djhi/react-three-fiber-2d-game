import React, { Suspense } from "react";
import { Canvas } from "react-three-fiber";
import { Physics } from "use-cannon";

import { Background, Camera } from "../lib";
import { GameEntitiesProvider } from "./GameEntities";
import { CollisionGroups } from "./constants";

import grassBackground from "./World/GrassBackground.png";
import { Bush } from "./World/Bush";
import { Player } from "./Player/Player";
import { Bat } from "./Enemies/Bat";

function Game() {
  return (
    <Canvas>
      <ambientLight />

      <Suspense fallback={null}>
        <GameEntitiesProvider>
          <Camera />
          <Scene />
        </GameEntitiesProvider>
      </Suspense>
    </Canvas>
  );
}

function Scene() {
  return (
    <scene>
      <Physics gravity={[0, 0, 0]}>
        <Background
          url={grassBackground}
          collisionFilterGroup={CollisionGroups.Ignore}
        />
        <Bush name="bush1" position={[1, 2, 0]} />
        <Bush name="bush2" position={[-1, -2, 0]} />
        <Player name="player" position={[0, 0, 0]} />
        {Array.from(Array(30).keys()).map((_, index) => {
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
        })}
      </Physics>
    </scene>
  );
}

export default Game;
