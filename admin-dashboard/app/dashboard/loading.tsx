import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardLoading() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg border border-black/10 bg-neutral-300"
          />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-lg border border-black/10 bg-neutral-300"
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
