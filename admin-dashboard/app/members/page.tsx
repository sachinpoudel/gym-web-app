import DashboardLayout from "@/components/layout/DashboardLayout";
import MembersClient from "@/app/members/components/MembersClient";
import { cookies } from "next/headers";
import { getMembers } from "@/lib/api";
import type { Member } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// No fallback getDaysLeft. We strictly require it from the backend.

export default async function MembersPage() {
  const token = cookies().get("admin_token")?.value;
  const response = await getMembers(token, { page: "1", limit: "20" });

  const members: Member[] = (!response.success || !response.data
    ? []
    : response.data.data
  ).map((m) => {
    if (typeof m.daysLeft !== "number") {
      throw new Error(`Critical data missing: daysLeft for member ${m.id}`);
    }
    const daysLeft = m.daysLeft;

    const fullName =
      m.fullName ||
      [m.firstName, m.lastName].filter(Boolean).join(" ").trim();
    return { ...m, fullName, daysLeft };
  });

  return (
    <DashboardLayout title="Members">
      <MembersClient
        initialMembers={members}
        initialTotal={response.success && response.data ? response.data.total : 0}
        initialPage={1}
        initialLimit={20}
      />
    </DashboardLayout>
  );
}
