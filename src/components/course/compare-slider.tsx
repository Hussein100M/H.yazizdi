"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { ImageRef } from "@/lib/blocks";

/** مقارنة قبل/بعد بمنزلق — الأداة نفسها التي يوصي بها الدليل قبل تسليم أي صورة. */
export function CompareSlider({ before, after }: { before: ImageRef; after: ImageRef }) {
  const [position, setPosition] = useState(50);
  const frame = useRef<HTMLDivElement>(null);

  const moveTo = useCallback((clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, ratio)));
  }, []);

  return (
    <div>
      <div
        ref={frame}
        className="plate relative aspect-[3/2] w-full select-none overflow-hidden"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          moveTo(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) moveTo(event.clientX);
        }}
      >
        <Image
          src={after.src}
          alt={after.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 760px"
          className="object-cover"
        />
        <div
          className="absolute inset-y-0 start-0 overflow-hidden"
          style={{ width: `${100 - position}%` }}
        >
          <div className="absolute inset-y-0 end-0 w-[var(--frame-w)]" style={{ ["--frame-w" as string]: "100vw" }}>
            <Image
              src={before.src}
              alt={before.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-cover"
              style={{ objectPosition: "center" }}
            />
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-crimson"
          style={{ insetInlineStart: `${100 - position}%` }}
          aria-hidden
        />

        <span className="pointer-events-none absolute top-3 start-3 bg-ink/85 px-2 py-1 text-[0.75rem] text-white">
          {before.label ?? "قبل"}
        </span>
        <span className="pointer-events-none absolute top-3 end-3 bg-crimson px-2 py-1 text-[0.75rem] text-white">
          {after.label ?? "بعد"}
        </span>
      </div>

      <label className="mt-3 block">
        <span className="text-fine text-[var(--text-muted)]">
          اسحب للمقارنة بين {before.label ?? "قبل"} و{after.label ?? "بعد"}
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="mt-2 w-full accent-[var(--color-crimson)]"
          aria-label="موضع المقارنة بين الصورتين"
        />
      </label>
    </div>
  );
}
