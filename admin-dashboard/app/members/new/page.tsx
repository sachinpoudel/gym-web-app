"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AddMemberModal from "@/app/members/components/AddMemberModal";
import type { Member } from "@/types";

export default function NewMemberPage() {
  const router = useRouter();

  const handleSuccess = (_member: Member) => {
    router.push("/members");
  };

  return (
    <DashboardLayout title="Add New Member">
      <AddMemberModal onClose={() => router.back()} onSuccess={handleSuccess} />
    </DashboardLayout>
  );
}
