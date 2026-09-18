import { z } from "zod";

/**
 * التحقق من متغيّرات البيئة عند الإقلاع — أفضل من انفجار غامض وقت التشغيل.
 * لا تُطبع أي قيمة سرّية في رسائل الخطأ.
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL مطلوب"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET يجب أن يكون ٣٢ حرفاً فأكثر"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  PAYMENT_PROVIDER: z.enum(["manual", "stripe", "moyasar", "tap"]).default("manual"),
  PAYMENT_API_KEY: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  VIDEO_PROVIDER: z.string().optional(),
  VIDEO_SIGNING_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

let cached: z.infer<typeof schema> | null = null;

export function env(): z.infer<typeof schema> {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((issue) => issue.path.join(".")).join("، ");
    throw new Error(`إعدادات البيئة غير مكتملة: ${keys}. راجع ملف .env.example`);
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = () => process.env.NODE_ENV === "production";
