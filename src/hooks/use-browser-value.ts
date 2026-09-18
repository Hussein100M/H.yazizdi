"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * قراءة قيم المتصفح دون setState داخل useEffect.
 * على السيرفر تُعاد القيمة الافتراضية، وبعد الترطيب القيمة الحقيقية.
 */

const noopSubscribe = () => () => {};

export function useBrowserValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, read, () => serverValue);
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

// ── تخزين محلي مشترك: الكتابة تُعلم كل القرّاء ──
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // التخزين قد يكون معطّلاً في وضع التصفح الخاص
  }
}

export function writeLocal(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // تجاهل: الواجهة تبقى صالحة لهذه الجلسة
  }
  emit();
}

export function useLocalValue(key: string): string | null {
  const subscribe = useCallback((onChange: () => void) => {
    listeners.add(onChange);
    window.addEventListener("storage", onChange);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => readLocal(key),
    () => null,
  );
}
