import DashboardLayout from "@/components/layout/DashboardLayout";

export default function MemberLoading() {
  return (
    <DashboardLayout title="Member Profile">
      <div className="h-96 animate-pulse rounded-lg border border-black/10 bg-neutral-100" />
    </DashboardLayout>
  );
}
