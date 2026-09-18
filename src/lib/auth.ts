import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { env, isProduction } from "@/lib/env";
import type { Role, User } from "@/generated/prisma";

const SESSION_COOKIE = "arch_session";
const SESSION_TTL_DAYS = 30;
const BCRYPT_ROUNDS = 12;

/** الكوكي يحمل الرمز الخام؛ قاعدة البيانات تخزّن تجزئته فقط، فتسريب نسخة القاعدة لا يمنح جلسات. */
function hashToken(token: string): string {
  return createHash("sha256").update(`${token}${env().AUTH_SECRET}`).digest("hex");
}

export function hashIp(ip: string | null): string {
  return createHash("sha256").update(`${ip ?? "unknown"}${env().AUTH_SECRET}`).digest("hex").slice(0, 32);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function safeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

export async function createSession(
  userId: string,
  meta: { userAgent?: string | null; ip?: string | null } = {},
): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      userAgent: meta.userAgent?.slice(0, 255) ?? null,
      ipHash: meta.ip ? hashIp(meta.ip) : null,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

/** المستخدم الحالي أو null. تُقرأ في Server Components فقط. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt.getTime() < Date.now()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return toSessionUser(session.user);
}

export function toSessionUser(user: User): SessionUser {
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new AuthError("FORBIDDEN");
  return user;
}

export class AuthError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(code);
    this.name = "AuthError";
  }
}

/** تحديد معدّل المحاولات: ٥ محاولات فاشلة لكل بريد/عنوان خلال ١٥ دقيقة. */
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function isRateLimited(emailKey: string, ip: string | null): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
  const failures = await prisma.loginAttempt.count({
    where: {
      successful: false,
      createdAt: { gte: since },
      OR: [{ emailKey }, { ipHash: hashIp(ip) }],
    },
  });
  return failures >= MAX_ATTEMPTS;
}

export async function recordLoginAttempt(
  emailKey: string,
  ip: string | null,
  successful: boolean,
  userId?: string,
): Promise<void> {
  await prisma.loginAttempt.create({
    data: { emailKey, ipHash: hashIp(ip), successful, userId: userId ?? null },
  });
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createRawToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function hashRawToken(token: string): string {
  return hashToken(token);
}
