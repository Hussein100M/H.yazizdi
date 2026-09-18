import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EmptyState } from "@/components/ui/states";
import { grantAccessAction, revokeAccessAction } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "الطلاب",
  robots: { index: false, follow: false },
};

const statusLabel: Record<string, string> = {
  ACTIVE: "نشط",
  PENDING: "قيد التأكيد",
  REVOKED: "ملغى",
};

export default async function AdminStudentsPage() {
  await requireAdmin();

  const [students, course] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        enrollments: { select: { id: true, status: true, courseId: true } },
        _count: { select: { progress: true } },
      },
    }),
    prisma.course.findFirst({ where: { isPublished: true }, select: { id: true } }),
  ]);

  if (students.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState title="لا طلاب بعد" description="سيظهر الطلاب هنا فور إنشائهم حسابات." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="annot">Students</p>
      <h1 className="mt-2 text-[1.75rem]">الطلاب</h1>

      <div className="plate mt-8 overflow-x-auto">
        <table className="w-full text-start text-fine">
          <thead className="border-b border-[var(--hairline)] text-[var(--text-muted)]">
            <tr>
              <th scope="col" className="p-3 text-start font-medium">الاسم</th>
              <th scope="col" className="p-3 text-start font-medium">البريد</th>
              <th scope="col" className="p-3 text-start font-medium">الوصول</th>
              <th scope="col" className="p-3 text-start font-medium">دروس متابَعة</th>
              <th scope="col" className="p-3 text-start font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--hairline)]">
            {students.map((student) => {
              const enrollment = student.enrollments[0];
              return (
                <tr key={student.id}>
                  <td className="p-3 text-[var(--text-strong)]">{student.fullName}</td>
                  <td className="p-3" dir="ltr">
                    {student.email}
                  </td>
                  <td className="p-3">
                    {enrollment ? statusLabel[enrollment.status] ?? enrollment.status : "بلا اشتراك"}
                  </td>
                  <td className="p-3">{student._count.progress.toLocaleString("ar-EG")}</td>
                  <td className="p-3">
                    {enrollment?.status === "ACTIVE" ? (
                      <form action={revokeAccessAction}>
                        <input type="hidden" name="enrollmentId" value={enrollment.id} />
                        <button type="submit" className="link-underline text-crimson">
                          إلغاء الوصول
                        </button>
                      </form>
                    ) : course ? (
                      <form action={grantAccessAction}>
                        <input type="hidden" name="userId" value={student.id} />
                        <input type="hidden" name="courseId" value={course.id} />
                        <button type="submit" className="link-underline text-[var(--text-strong)]">
                          منح الوصول
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
