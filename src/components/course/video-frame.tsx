import type { PlaybackSource } from "@/lib/video";

/**
 * إطار الفيديو. المصدر يأتي موقَّعاً من السيرفر بعد التحقق من الوصول،
 * ولا يُخزَّن أي رابط قابل للتشغيل في قاعدة البيانات.
 */
export function VideoFrame({ source, poster }: { source: PlaybackSource; poster?: string }) {
  return (
    <div className="plate relative aspect-video w-full overflow-hidden bg-black">
      <video
        controls
        preload="metadata"
        poster={poster}
        className="h-full w-full"
        controlsList="nodownload"
      >
        <source src={source.src} type={source.type === "hls" ? "application/x-mpegURL" : "video/mp4"} />
        متصفحك لا يدعم تشغيل الفيديو. حدّثه أو افتح الدرس من متصفح آخر.
      </video>
    </div>
  );
}
