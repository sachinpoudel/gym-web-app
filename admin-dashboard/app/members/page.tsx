import DashboardLayout from "@/components/layout/DashboardLayout";
import MembersClient from "@/app/members/components/MembersClient";
import { cookies } from "next/headers";
import { getMembers } from "@/lib/api";
import type { Member } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const getDaysLeft = (member: Member) => {
  if (typeof member.daysLeft === "number") return member.daysLeft;
  const expiry = new Date(member.expiryDate);
  return Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

export default async function MembersPage() {
  const token = cookies().get("admin_token")?.value;
  const response = await getMembers(token);

  const members: Member[] = (!response.success || !response.data
    ? []
    : response.data
  ).map((m) => {
    const daysLeft = getDaysLeft(m);
    const fullName =
      m.fullName ||
      [m.firstName, m.lastName].filter(Boolean).join(" ").trim();
    return { ...m, fullName, daysLeft };
  });

  return (
    <DashboardLayout title="Members">
      <MembersClient initialMembers={members} />
    </DashboardLayout>
  );
}
