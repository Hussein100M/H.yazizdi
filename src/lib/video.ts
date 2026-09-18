import "server-only";

import { env } from "@/lib/env";

/**
 * طبقة الفيديو.
 * قاعدة البيانات تخزّن معرّف الأصل لدى المزوّد فقط (videoAssetId) — لا رابط مباشر.
 * الرابط القابل للتشغيل يُولَّد على السيرفر لكل جلسة، بعد التحقق من الوصول.
 *
 * الحالة الآن: لا يوجد مزوّد مضبوط، والدورة تعمل بلا فيديو.
 * لإضافة مزوّد (Mux / Bunny / Cloudflare Stream): اضبط VIDEO_PROVIDER
 * وأكمل الحالة الموافقة أدناه. لا يتغير أي شيء في الواجهة.
 */

export type PlaybackSource = {
  src: string;
  type: "hls" | "mp4";
  expiresAt: number;
};

export function isVideoConfigured(): boolean {
  const { VIDEO_PROVIDER, VIDEO_SIGNING_KEY } = env();
  return Boolean(VIDEO_PROVIDER && VIDEO_SIGNING_KEY);
}

export async function createPlaybackSource(assetId: string): Promise<PlaybackSource | null> {
  if (!isVideoConfigured()) return null;

  switch (env().VIDEO_PROVIDER) {
    // TODO(استضافة الفيديو): وقّع رابط التشغيل بعمر قصير هنا.
    // case "mux": …
    // case "bunny": …
    default:
      void assetId;
      return null;
  }
}
