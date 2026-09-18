"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { materialVariants, moodVariants } from "@/components/three/materials";
import { supportsWebGL } from "@/components/three/webgl";
import { useQuality } from "@/components/three/scene";
import { useBrowserValue, useMediaQuery } from "@/hooks/use-browser-value";

const BuildingScene = dynamic(
  () => import("@/components/three/scene").then((mod) => mod.BuildingScene),
  { ssr: false },
);

/**
 * بطل الصفحة: نفس الكتلة، والخامة وحدها تتغير — وهو درس الوحدة ٠١ يحدث أمام الزائر.
 * إن تعذّر WebGL أو طلب المستخدم تقليل الحركة، يعمل المبدّل نفسه على صور الدليل الأصلية.
 */
export function HeroSpecimen() {
  const [materialIndex, setMaterialIndex] = useState(0);
  const [moodIndex, setMoodIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const quality = useQuality();
  const canUseWebGL = useBrowserValue(supportsWebGL, false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const material = materialVariants[materialIndex] ?? materialVariants[0]!;
  const mood = moodVariants[moodIndex] ?? moodVariants[0]!;

  // يُركَّب المشهد مرة واحدة عند ظهوره، ثم يتوقف رندره خارج الشاشة بدل تفكيكه
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        setInView(visible);
        if (visible) setMounted(true);
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // التبويب المخفي لا يستهلك إطارات
  useEffect(() => {
    const onChange = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  const showCanvas = canUseWebGL && mounted;

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="plate relative aspect-[4/3] w-full overflow-hidden bg-[#e3e7ec]"
      >
        <span className="plate-mark z-20">{material.id === "original" ? "REF" : "ALT"}</span>

        {showCanvas ? (
          <BuildingScene
            material={material}
            mood={mood}
            quality={quality}
            spin={!reducedMotion}
            active={inView && tabVisible}
          />
        ) : (
          <Image
            src={material.image}
            alt={`الكتلة المعمارية بخامة: ${material.detail}`}
            fill
            priority={materialIndex === 0}
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
          />
        )}

        <p className="pointer-events-none absolute bottom-0 start-0 end-0 z-10 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-10 text-fine text-white">
          {material.detail} — الكتلة والنسب وعدد الزعانف ثابتة
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <fieldset>
          <legend className="text-fine text-[var(--text-muted)]">
            غيّر الخامة، ولاحظ ما لم يتغيّر
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {materialVariants.map((variant, index) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setMaterialIndex(index)}
                aria-pressed={index === materialIndex}
                className={`h-9 rounded-[var(--radius-control)] border px-3 text-[0.8125rem] transition-colors ${
                  index === materialIndex
                    ? "border-crimson bg-crimson text-white"
                    : "border-[var(--hairline)] text-[var(--text-body)] hover:border-crimson hover:text-crimson"
                }`}
              >
                <span className="font-medium">{variant.label}</span>
                <span className="mx-1.5 opacity-50">·</span>
                <span className="opacity-90">{variant.detail}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {canUseWebGL ? (
          <fieldset>
            <legend className="text-fine text-[var(--text-muted)]">الأجواء</legend>
            <div className="mt-2 flex gap-2">
              {moodVariants.map((variant, index) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setMoodIndex(index)}
                  aria-pressed={index === moodIndex}
                  className={`h-9 rounded-[var(--radius-control)] border px-3 text-[0.8125rem] transition-colors ${
                    index === moodIndex
                      ? "border-ink bg-ink text-white"
                      : "border-[var(--hairline)] text-[var(--text-body)] hover:border-ink"
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}
      </div>
    </div>
  );
}
