"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createGradientTexture, darken } from "./backdrop";
import { useBrowserValue } from "@/hooks/use-browser-value";
import { FinnedMass } from "./finned-mass";
import type { MaterialVariant, MoodVariant } from "./materials";

/** مستوى جودة يُحسب من الجهاز — لا إعداد يدوي. */
function detectQuality(): "high" | "low" {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 900;
  const cores = navigator.hardwareConcurrency ?? 4;
  return coarse || narrow || cores <= 4 ? "low" : "high";
}

export function useQuality(): "high" | "low" {
  return useBrowserValue<"high" | "low">(detectQuality, "low");
}

function Lighting({ mood, quality }: { mood: MoodVariant; quality: "high" | "low" }) {
  return (
    <>
      <ambientLight color={mood.ambient.color} intensity={mood.ambient.intensity} />
      <directionalLight
        color={mood.key.color}
        intensity={mood.key.intensity}
        position={mood.key.position}
        castShadow={quality === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight
        color={mood.rim.color}
        intensity={mood.rim.intensity}
        position={[-4, 3, -5]}
      />
    </>
  );
}

/** الخلفية تُركَّب تصريحياً — لا تعديل مباشر على كائن المشهد. */
function Backdrop({ mood }: { mood: MoodVariant }) {
  const texture = useMemo(
    () => createGradientTexture(darken(mood.background, 0.14), mood.background),
    [mood.background],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <>
      <primitive object={texture} attach="background" />
      <fog attach="fog" args={[mood.fog, 18, 44]} />
    </>
  );
}

function Floor({ mood, quality }: { mood: MoodVariant; quality: "high" | "low" }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial
        color={mood.floor}
        roughness={quality === "high" ? 0.14 : 0.35}
        metalness={quality === "high" ? 0.55 : 0.2}
      />
    </mesh>
  );
}

export function BuildingScene({
  material,
  mood,
  quality,
  spin,
  active,
}: {
  material: MaterialVariant;
  mood: MoodVariant;
  quality: "high" | "low";
  spin: boolean;
  /** يتوقف الرندر تماماً خارج الشاشة أو عند إخفاء التبويب — دون تفكيك المشهد */
  active: boolean;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      shadows={quality === "high"}
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [0.2, 4.4, 11.4], fov: 32 }}
      gl={{ antialias: quality === "high", powerPreference: "high-performance" }}
      onCreated={({ gl, camera }) => {
        camera.lookAt(0, 0.15, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
      // اللوحة زخرفية: الوصف النصي والصور البديلة تحمل نفس المعنى
      aria-hidden
    >
      <Backdrop mood={mood} />
      <Lighting mood={mood} quality={quality} />
      <Floor mood={mood} quality={quality} />
      <FinnedMass material={material} mood={mood} quality={quality} spin={spin} />
    </Canvas>
  );
}
