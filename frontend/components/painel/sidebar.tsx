"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "./logoutButton";
import {
  isPainelLinkActive,
  painelAdminNavItems,
  painelJogadorNavItems,
} from "./nav-items";

export function PainelSidebar() {
  const pathname = usePathname();

  const navItems = pathname.startsWith("/painel/admin")
    ? painelAdminNavItems
    : painelJogadorNavItems;

  return (
    <aside className="fixed left-0 top-20 hidden h-[calc(100vh-80px)] w-[300px] flex-col border-r border-black/5 bg-[#f4f1e8] px-8 py-8 lg:flex">
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isPainelLinkActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-2xl px-3 py-3 transition",
                active
                  ? "bg-gray-900 text-white"
                  : "text-zinc-600 hover:bg-white hover:text-zinc-950",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-full transition",
                  active
                    ? "bg-white/15 text-white"
                    : "bg-[#ebe5d9] text-zinc-600 group-hover:bg-green-100 group-hover:text-green-700",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
              </span>

              <span className="truncate text-[15px] font-semibold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}