"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { ImageRef } from "@/lib/blocks";

/**
 * مقارنة قبل/بعد بمنزلق — الأداة نفسها التي يوصي بها الدليل قبل تسليم أي صورة.
 * «قبل» تشغل الجزء الأيمن (بداية القراءة بالعربية)، و«بعد» الجزء الأيسر.
 * divider يقاس من الحافة اليسرى الفيزيائية لتبقى الحسابات صحيحة في الاتجاهين.
 */
export function CompareSlider({ before, after }: { before: ImageRef; after: ImageRef }) {
  const [divider, setDivider] = useState(50);
  const frame = useRef<HTMLDivElement>(null);

  const moveTo = useCallback((clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setDivider(Math.max(0, Math.min(100, ratio)));
  }, []);

  return (
    <div>
      <div
        ref={frame}
        className="plate relative aspect-[3/2] w-full touch-none select-none overflow-hidden"
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

        {/* «قبل» تُقصّ من اليسار، فيظهر منها الجزء الأيمن فقط */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${divider}%)` }}>
          <Image
            src={before.src}
            alt={before.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 760px"
            className="object-cover"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-crimson"
          style={{ left: `${divider}%` }}
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
          value={100 - divider}
          onChange={(event) => setDivider(100 - Number(event.target.value))}
          className="mt-2 w-full accent-[var(--color-crimson)]"
          aria-label="موضع المقارنة بين الصورتين"
        />
      </label>
    </div>
  );
}
