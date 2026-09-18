"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 text-center"
    >
      <span className="fin-mark mx-auto mb-7 block h-8 w-16" aria-hidden />
      <h1 className="text-[1.75rem]">تعذّر عرض هذه الصفحة</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        حدث خطأ أثناء تحميل المحتوى. أعد المحاولة، وإن تكرّر الأمر تواصل مع الإدارة.
      </p>
      {error.digest ? (
        <p className="annot mt-4">معرّف الخطأ: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex justify-center">
        <Button onClick={reset}>أعد المحاولة</Button>
      </div>
    </main>
  );
}
