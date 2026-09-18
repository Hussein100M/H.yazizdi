/** أداة تطوير: تعليم كل دروس الدورة مكتملة لحساب بريد محدد (للاختبار فقط). */
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();
const email = process.argv[2];

async function main() {
  if (!email) throw new Error("مرّر البريد الإلكتروني: tsx scripts/complete-all.ts you@example.com");
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const lessons = await prisma.lesson.findMany({ select: { id: true } });
  for (const lesson of lessons) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      create: { userId: user.id, lessonId: lesson.id, completedAt: new Date() },
      update: { completedAt: new Date() },
    });
  }
  console.log(`علّم ${lessons.length} درساً مكتملاً لـ ${email}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
