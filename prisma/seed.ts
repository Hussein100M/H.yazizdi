import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { courseSeed } from "../src/content/course";
import { estimateMinutes } from "../src/lib/blocks";
import { pricing, instructor } from "../src/config/site";

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: courseSeed.slug },
    create: {
      slug: courseSeed.slug,
      title: courseSeed.title,
      titleEn: courseSeed.titleEn,
      tagline: courseSeed.tagline,
      summary: courseSeed.summary,
      heroImage: courseSeed.heroImage,
      priceAmount: pricing.amount,
      priceCurrency: pricing.currency,
      isPublished: true,
      instructor: instructor.name,
      instructorBio: instructor.bio,
    },
    update: {
      title: courseSeed.title,
      titleEn: courseSeed.titleEn,
      tagline: courseSeed.tagline,
      summary: courseSeed.summary,
      heroImage: courseSeed.heroImage,
      priceAmount: pricing.amount,
      priceCurrency: pricing.currency,
      isPublished: true,
      instructor: instructor.name,
      instructorBio: instructor.bio,
    },
  });

  let moduleOrder = 0;
  for (const moduleSeed of courseSeed.modules) {
    const module = await prisma.module.upsert({
      where: { courseId_slug: { courseId: course.id, slug: moduleSeed.slug } },
      create: {
        courseId: course.id,
        slug: moduleSeed.slug,
        title: moduleSeed.title,
        titleEn: moduleSeed.titleEn,
        summary: moduleSeed.summary,
        badge: moduleSeed.badge,
        order: moduleOrder,
      },
      update: {
        title: moduleSeed.title,
        titleEn: moduleSeed.titleEn,
        summary: moduleSeed.summary,
        badge: moduleSeed.badge,
        order: moduleOrder,
      },
    });
    moduleOrder += 1;

    let lessonOrder = 0;
    for (const lessonSeed of moduleSeed.lessons) {
      const lesson = await prisma.lesson.upsert({
        where: { moduleId_slug: { moduleId: module.id, slug: lessonSeed.slug } },
        create: {
          moduleId: module.id,
          slug: lessonSeed.slug,
          title: lessonSeed.title,
          titleEn: lessonSeed.titleEn ?? null,
          summary: lessonSeed.summary,
          kind: lessonSeed.kind,
          order: lessonOrder,
          minutes: estimateMinutes(lessonSeed.blocks),
          isPreview: lessonSeed.isPreview ?? false,
        },
        update: {
          title: lessonSeed.title,
          titleEn: lessonSeed.titleEn ?? null,
          summary: lessonSeed.summary,
          kind: lessonSeed.kind,
          order: lessonOrder,
          minutes: estimateMinutes(lessonSeed.blocks),
          isPreview: lessonSeed.isPreview ?? false,
        },
      });
      lessonOrder += 1;

      // الكتل تُستبدل بالكامل: ملف المحتوى هو مصدر الحقيقة
      await prisma.lessonBlock.deleteMany({ where: { lessonId: lesson.id } });
      await prisma.lessonBlock.createMany({
        data: lessonSeed.blocks.map((block, index) => ({
          lessonId: lesson.id,
          kind: block.kind,
          order: index,
          data: block,
        })),
      });
    }
  }

  // حساب إداري للتطوير فقط — كلمة المرور تُقرأ من البيئة ولا توجد قيمة افتراضية في الإنتاج.
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      create: {
        email: adminEmail.toLowerCase(),
        fullName: instructor.name,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "ADMIN",
      },
      update: { role: "ADMIN" },
    });
    console.log(`✓ حساب الإدارة: ${adminEmail}`);
  } else {
    console.log("• لم يُنشأ حساب إدارة (اضبط SEED_ADMIN_EMAIL و SEED_ADMIN_PASSWORD)");
  }

  const lessonCount = await prisma.lesson.count();
  const moduleCount = await prisma.module.count();
  console.log(`✓ الدورة: ${course.title}`);
  console.log(`✓ ${moduleCount} وحدات · ${lessonCount} درساً`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
