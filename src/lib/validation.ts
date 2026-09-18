import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب ألا تقل عن ٨ أحرف")
  .max(200, "كلمة المرور طويلة جداً")
  .refine((value) => /[A-Za-z؀-ۿ]/.test(value) && /\d/.test(value), {
    message: "استخدم حروفاً وأرقاماً معاً",
  });

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "اكتب اسمك الكامل")
      .max(80, "الاسم طويل جداً"),
    email: z.string().trim().toLowerCase().email("صيغة البريد الإلكتروني غير صحيحة"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("صيغة البريد الإلكتروني غير صحيحة"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z.string().trim().min(3, "اكتب اسمك الكامل").max(80, "الاسم طويل جداً"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "أدخل كلمة المرور الحالية"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const progressSchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean().optional(),
  seconds: z.number().int().min(0).max(60 * 60 * 24).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
