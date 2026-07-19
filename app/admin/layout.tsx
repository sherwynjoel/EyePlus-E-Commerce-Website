import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    redirect("/auth/login?next=/admin");
  }

  return <AdminShell>{children}</AdminShell>;
}
