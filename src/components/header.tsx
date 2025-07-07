"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Wrench } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthStatus } from "./auth-status";

const AppLogo = () => (
  <Link href="/" className="flex items-center gap-2" prefetch={false}>
    <Wrench className="h-7 w-7 text-primary" />
    <span className="text-xl font-bold text-primary tracking-tighter">
      ServiçoPro
    </span>
  </Link>
);

const NavLinks = () => (
  <>
    <Button variant="ghost" asChild>
      <Link href="/" prefetch={false}>
        Encontrar Profissionais
      </Link>
    </Button>
    <Button variant="ghost" asChild>
      <Link href="/plans" prefetch={false}>
        Planos
      </Link>
    </Button>
    <Button variant="ghost" asChild>
      <Link href="/#about" prefetch={false}>
        Sobre Nós
      </Link>
    </Button>
  </>
);

export function Header() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <AppLogo />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                <AppLogo />
                <NavLinks />
                <div className="mt-4">
                  <AuthStatus />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <AppLogo />
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 mx-6 text-sm font-medium">
          <NavLinks />
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
