"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createRawToken,
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  hashRawToken,
  isRateLimited,
  normalizeEmail,
  recordLoginAttempt,
  verifyPassword,
} from "@/lib/auth";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation";

export type ActionState = {
  error?: string;
  success?: string;
  /** يُستخدم في بيئة التطوير فقط لعرض رابط إعادة التعيين بدل إرساله بالبريد */
  devResetUrl?: string;
};

async function requestMeta() {
  const headerList = await headers();
  return {
    ip:
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip") ??
      null,
    userAgent: headerList.get("user-agent"),
  };
}

/** تحقق من أن الطلب جاء من نفس الموقع — دفاع إضافي فوق SameSite=Lax. */
async function assertSameOrigin(): Promise<void> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (!origin) return; // طلبات بلا origin لا تأتي من متصفح عبر موقع آخر
  const host = headerList.get("host");
  if (!host) throw new Error("طلب غير صالح");
  try {
    if (new URL(origin).host !== host) throw new Error("طلب غير صالح");
  } catch {
    throw new Error("طلب غير صالح");
  }
}

export async function registerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();

  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "راجع بيانات التسجيل" };
  }

  const email = normalizeEmail(parsed.data.email);
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { error: "هذا البريد مسجّل بالفعل. سجّل الدخول بدل إنشاء حساب جديد." };
  }

  const user = await prisma.user.create({
    data: {
      email,
      fullName: parsed.data.fullName,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  const meta = await requestMeta();
  await createSession(user.id, meta);
  redirect("/dashboard");
}

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "راجع بيانات الدخول" };
  }

  const email = normalizeEmail(parsed.data.email);
  const meta = await requestMeta();

  if (await isRateLimited(email, meta.ip)) {
    return { error: "محاولات كثيرة. انتظر ربع ساعة ثم أعد المحاولة." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;

  if (!user || !valid) {
    await recordLoginAttempt(email, meta.ip, false, user?.id);
    // رسالة واحدة للحالتين: لا نكشف أي البريدين مسجّل
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
  }

  await recordLoginAttempt(email, meta.ip, true, user.id);
  await createSession(user.id, meta);

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await assertSameOrigin();
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();

  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "أدخل بريداً صحيحاً" };
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  // الرد نفسه سواء وُجد الحساب أم لا
  const sameResponse: ActionState = {
    success: "إن كان هذا البريد مسجّلاً، فسيصلك رابط إعادة التعيين خلال دقائق.",
  };

  if (!user) return sameResponse;

  const { token, tokenHash } = createRawToken();
  await prisma.passwordResetToken.create({
    data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/reset-password/${token}`;

  if (process.env.NODE_ENV === "production") {
    // TODO(البريد): أرسل resetUrl عبر مزوّد البريد المعتمد.
    return sameResponse;
  }

  return { ...sameResponse, devResetUrl: resetUrl };
}

export async function resetPasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "راجع البيانات" };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashRawToken(parsed.data.token) },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { error: "هذا الرابط منتهي أو مستخدم. اطلب رابطاً جديداً." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // كل الجلسات القائمة تُلغى بعد تغيير كلمة المرور
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  redirect("/login?reset=1");
}

export async function updateProfileAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();

  const user = await getCurrentUser();
  if (!user) return { error: "سجّل الدخول أولاً." };

  const parsed = profileSchema.safeParse({ fullName: formData.get("fullName") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "راجع البيانات" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { fullName: parsed.data.fullName },
  });

  return { success: "حُفظ الاسم." };
}

export async function changePasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();

  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { error: "سجّل الدخول أولاً." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "راجع البيانات" };
  }

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return { error: "كلمة المرور الحالية غير صحيحة." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });

  return { success: "غُيّرت كلمة المرور." };
}
