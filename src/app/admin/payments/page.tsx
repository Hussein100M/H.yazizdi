import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EmptyState } from "@/components/ui/states";
import { confirmPaymentAction } from "@/app/actions/admin";
import { formatPrice } from "@/config/site";

export const metadata: Metadata = {
  title: "المدفوعات",
  robots: { index: false, follow: false },
};

const statusLabel: Record<string, string> = {
  INITIATED: "أُنشئ",
  AWAITING_CONFIRMATION: "بانتظار التأكيد",
  PAID: "مدفوع",
  FAILED: "فشل",
  REFUNDED: "مسترجع",
};

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { fullName: true, email: true } } },
  });

  if (payments.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="لا طلبات دفع"
          description="ستظهر طلبات الاشتراك هنا فور إنشائها من صفحة الاشتراك."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="annot">Payments</p>
      <h1 className="mt-2 text-[1.75rem]">المدفوعات</h1>
      <p className="mt-3 max-w-[70ch] text-fine text-[var(--text-muted)]">
        تأكيد الدفعة يفتح وصول الطالب فوراً. أكّدها فقط بعد التحقق من وصول المبلغ فعلاً.
      </p>

      <div className="plate mt-8 overflow-x-auto">
        <table className="w-full text-start text-fine">
          <thead className="border-b border-[var(--hairline)] text-[var(--text-muted)]">
            <tr>
              <th scope="col" className="p-3 text-start font-medium">الطالب</th>
              <th scope="col" className="p-3 text-start font-medium">المبلغ</th>
              <th scope="col" className="p-3 text-start font-medium">المزوّد</th>
              <th scope="col" className="p-3 text-start font-medium">الحالة</th>
              <th scope="col" className="p-3 text-start font-medium">التاريخ</th>
              <th scope="col" className="p-3 text-start font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--hairline)]">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="p-3">
                  <span className="block text-[var(--text-strong)]">{payment.user.fullName}</span>
                  <span className="block text-[0.75rem] text-[var(--text-muted)]" dir="ltr">
                    {payment.user.email}
                  </span>
                </td>
                <td className="p-3">{formatPrice(payment.amount)}</td>
                <td className="p-3">{payment.provider}</td>
                <td className="p-3">{statusLabel[payment.status] ?? payment.status}</td>
                <td className="p-3">
                  {new Intl.DateTimeFormat("ar-SA", { dateStyle: "short" }).format(
                    payment.createdAt,
                  )}
                </td>
                <td className="p-3">
                  {payment.status === "AWAITING_CONFIRMATION" || payment.status === "INITIATED" ? (
                    <form action={confirmPaymentAction}>
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <button type="submit" className="link-underline text-[var(--text-strong)]">
                        أكّد الدفعة
                      </button>
                    </form>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
