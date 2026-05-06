import DashboardLayout from "@/components/layout/DashboardLayout";

export default function MembersLoading() {
  return (
    <DashboardLayout title="Members">
      <div className="h-96 animate-pulse rounded-lg border border-black/10 bg-neutral-100" />
    </DashboardLayout>
  );
}
