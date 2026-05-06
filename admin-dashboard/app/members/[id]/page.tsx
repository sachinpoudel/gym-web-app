import { cookies } from "next/headers";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import { getMemberById } from "@/lib/api";
import MemberProfile from "@/app/members/[id]/MemberProfile";

export default async function MemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const token = cookies().get("admin_token")?.value;
  const response = await getMemberById(params.id, token);

  if (!response.success || !response.data) {
    return (
      <DashboardLayout title="Member Profile">
        <div className="rounded-lg border border-black/10 bg-white p-6 text-sm text-black">
          Failed to load member. Try again.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Member Profile">
      <Card>
        <MemberProfile member={response.data} />
      </Card>
    </DashboardLayout>
  );
}
