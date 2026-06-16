"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearAuthStorage } from "@/lib/auth-storage";

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearAuthStorage();
    router.push("/login");
  }

  return (
    <Button
      type="button"
      onClick={handleLogout}
      className="h-[50px] w-full rounded-2xl bg-red-100 text-sm font-bold text-red-600 hover:bg-red-100"
      variant="ghost"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sair
    </Button>
  );
}