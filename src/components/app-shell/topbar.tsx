"use client";

import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/ui/primitives";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav } from "./sidebar";
import { sair } from "@/app/(auth)/actions";

export function Topbar({
  nome,
  email,
}: {
  nome: string | null;
  email: string | null;
}) {
  const [menu, setMenu] = useState(false);
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-surface/80 px-4 backdrop-blur lg:px-6">
        <button
          className="text-muted hover:text-foreground lg:hidden"
          onClick={() => setDrawer(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="lg:hidden">
          <Logo showText={false} />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setMenu((v) => !v)}
              onBlur={() => setTimeout(() => setMenu(false), 150)}
              className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-surface-2"
            >
              <Avatar nome={nome} />
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {nome ?? "Conta"}
              </span>
            </button>
            {menu && (
              <div className="animate-fade-in absolute right-0 top-12 w-56 rounded-[var(--radius-card)] border bg-surface p-1.5 shadow-lg">
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {nome}
                  </p>
                  <p className="truncate text-xs text-muted">{email}</p>
                </div>
                <div className="my-1 border-t" />
                <form action={sair}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground hover:bg-surface-2"
                  >
                    <LogOut className="size-4" />
                    Sair
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawer(false)}
          />
          <div className="animate-fade-in absolute left-0 top-0 h-full w-64 border-r bg-surface p-4">
            <div className="flex items-center justify-between px-2">
              <Logo />
              <button onClick={() => setDrawer(false)} aria-label="Fechar">
                <X className="size-5 text-muted" />
              </button>
            </div>
            <div className="mt-6">
              <SidebarNav onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
