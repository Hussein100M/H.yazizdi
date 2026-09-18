"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MaterialVariant, MoodVariant } from "./materials";

/**
 * المبنى المرجعي للدليل التدريبي: كتلة مكعّبة بزعانف رأسية + جناح منخفض بسطح منحنٍ.
 * الهندسة كلها إجرائية — لا يُحمَّل أي ملف نموذج، فحجم الأصول صفر.
 * الكتلة والنسب وعدد الزعانف ثوابت لا تتغير مع الخامة، وهو مبدأ الدورة نفسه.
 */

const MASS = { width: 4.2, height: 3.4, depth: 3.2 };
const WING = { width: 3.4, height: 1.25, depth: 2.1 };
const FIN = { thickness: 0.038, depth: 0.075, gap: 0.142 };

function useFinTransforms(quality: "high" | "low") {
  return useMemo(() => {
    const gap = quality === "high" ? FIN.gap : FIN.gap * 1.6;
    const transforms: { position: [number, number, number]; rotation: [number, number, number]; scaleY: number }[] = [];

    // الواجهة الأمامية للكتلة
    const frontCount = Math.floor(MASS.width / gap);
    const frontStart = -MASS.width / 2 + gap / 2;
    for (let i = 0; i < frontCount; i += 1) {
      transforms.push({
        position: [frontStart + i * gap, MASS.height / 2, MASS.depth / 2 + FIN.depth / 2],
        rotation: [0, 0, 0],
        scaleY: MASS.height,
      });
    }

    // الواجهة الجانبية للكتلة
    const sideCount = Math.floor(MASS.depth / gap);
    const sideStart = -MASS.depth / 2 + gap / 2;
    for (let i = 0; i < sideCount; i += 1) {
      transforms.push({
        position: [MASS.width / 2 + FIN.depth / 2, MASS.height / 2, sideStart + i * gap],
        rotation: [0, Math.PI / 2, 0],
        scaleY: MASS.height,
      });
    }

    // واجهة الجناح المنخفض
    const wingCount = Math.floor(WING.width / gap);
    const wingStart = -MASS.width / 2 - WING.width + gap / 2;
    for (let i = 0; i < wingCount; i += 1) {
      const t = i / Math.max(1, wingCount - 1);
      // السطح المنحني: أعلى في الوسط وأخفض عند الأطراف
      const curve = Math.sin(t * Math.PI) * 0.34;
      transforms.push({
        position: [wingStart + i * gap, (WING.height + curve) / 2, WING.depth / 2 + FIN.depth / 2],
        rotation: [0, 0, 0],
        scaleY: WING.height + curve,
      });
    }

    return transforms;
  }, [quality]);
}

/** ترتيب مستقر لا يتغير بين الإطارات — بذرة ثابتة لا Math.random */
function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function LitWindows({ config }: { config: NonNullable<MoodVariant["litWindows"]> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const cells = useMemo(() => {
    const size = { w: 0.075, h: 0.17 };
    const stepX = 0.142 * 2;
    const stepY = 0.34;
    const items: [number, number][] = [];
    const columns = Math.floor((MASS.width - 0.2) / stepX);
    const rows = Math.floor((MASS.height - 0.3) / stepY);
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        if (pseudoRandom(column * 31 + row * 7 + 1) > config.ratio) continue;
        items.push([
          -MASS.width / 2 + 0.14 + column * stepX,
          0.28 + row * stepY,
        ]);
      }
    }
    return { items, size };
  }, [config.ratio]);

  useLayoutEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    cells.items.forEach(([x, y], index) => {
      dummy.position.set(x, y, MASS.depth / 2 + 0.012);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instanced.setMatrixAt(index, dummy.matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
  }, [cells, dummy]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, cells.items.length]} key={cells.items.length}>
      <planeGeometry args={[cells.size.w, cells.size.h]} />
      <meshBasicMaterial color={config.color} toneMapped={false} />
    </instancedMesh>
  );
}

function WingBody({ color, roughness, metalness }: MaterialVariant["body"]) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(WING.width, 0);
    shape.lineTo(WING.width, WING.height);
    // حافة علوية منحنية — نفس منحنى المظلة في صور الدليل
    shape.quadraticCurveTo(WING.width * 0.45, WING.height + 0.62, 0, WING.height);
    shape.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: WING.depth, bevelEnabled: false });
    geo.translate(-MASS.width / 2 - WING.width, 0, -WING.depth / 2);
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

export function FinnedMass({
  material,
  mood,
  quality,
  spin = true,
}: {
  material: MaterialVariant;
  mood: MoodVariant;
  quality: "high" | "low";
  spin?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const fins = useRef<THREE.InstancedMesh>(null);
  const transforms = useFinTransforms(quality);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const BASE_YAW = -0.38;

  useFrame((state) => {
    if (!group.current) return;
    // تأرجح محدود حول زاوية الثلاثة أرباع المميزة — لا دوران استعراضي كامل
    group.current.rotation.y = spin
      ? BASE_YAW + Math.sin(state.clock.elapsedTime * 0.22) * 0.2
      : BASE_YAW;
    // ميل لطيف يتتبع المؤشر — استجابة لفعل المستخدم
    const targetX = state.pointer.y * 0.05;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
  });

  // ترتيب الزعانف بعد تركيب الشبكة — المرجع لا يكون جاهزاً أثناء الرسم
  useLayoutEffect(() => {
    const mesh = fins.current;
    if (!mesh) return;
    transforms.forEach((item, index) => {
      dummy.position.set(...item.position);
      dummy.rotation.set(...item.rotation);
      dummy.scale.set(1, item.scaleY, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [transforms, dummy]);

  return (
    <group ref={group} position={[1.7, -1.2, 0]} rotation={[0, -0.38, 0]}>
      {/* الكتلة الرئيسية */}
      <mesh position={[0, MASS.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[MASS.width, MASS.height, MASS.depth]} />
        <meshStandardMaterial
          color={material.body.color}
          roughness={material.body.roughness}
          metalness={material.body.metalness}
        />
      </mesh>

      {/* السطح العلوي بلون الخامة — كما في صور الدليل */}
      <mesh position={[0, MASS.height + 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[MASS.width + FIN.depth * 2, MASS.depth + FIN.depth * 2]} />
        <meshStandardMaterial
          color={material.fin.color}
          roughness={material.fin.roughness}
          metalness={material.fin.metalness}
        />
      </mesh>

      {mood.litWindows ? <LitWindows config={mood.litWindows} /> : null}

      <WingBody {...material.body} />

      {/* الزعانف — عدد وتباعد ثابتان مهما تغيّرت الخامة */}
      <instancedMesh
        ref={fins}
        args={[undefined, undefined, transforms.length]}
        castShadow
        key={transforms.length}
      >
        <boxGeometry args={[FIN.thickness, 1, FIN.depth]} />
        <meshStandardMaterial
          color={material.fin.color}
          roughness={material.fin.roughness}
          metalness={material.fin.metalness}
        />
      </instancedMesh>
    </group>
  );
}
