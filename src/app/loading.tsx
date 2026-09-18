import { LoadingState } from "@/components/ui/states";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <LoadingState label="جارٍ تحميل الصفحة" />
    </div>
  );
}
