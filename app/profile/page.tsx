"use client";

import { ProfileScreen } from "@/components/profile/ProfileScreen";
import { BottomNav } from "@/components/layout/BottomNav";

export default function ProfilePage() {
  return (
    <div className="flex h-full flex-col">
      <ProfileScreen />
      <BottomNav />
    </div>
  );
}
