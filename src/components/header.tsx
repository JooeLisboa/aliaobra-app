"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Wrench, MessageSquare } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthStatus } from "./auth-status";
import { useUser } from "@/hooks/use-user";

const AppLogo = () => (
  <Link href="/" className="flex items-center gap-2" prefetch={false}>
    <Wrench className="h-7 w-7 text-primary" />
    <span className="text-xl font-bold text-primary tracking-tighter">
      AliaObra
    </span>
  </Link>
);

const NavLinks = ({ isLoggedIn }: { isLoggedIn: boolean }) => (
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
    {isLoggedIn && (
      <Button variant="ghost" asChild>
        <Link href="/chat" prefetch={false} className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          Mensagens
        </Link>
      </Button>
    )}
  </>
);

export function Header() {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const isLoggedIn = !!user;

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
                <NavLinks isLoggedIn={isLoggedIn} />
                <div className="mt-4 border-t pt-4">
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
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 mx-6 text-sm font-medium">
          <NavLinks isLoggedIn={isLoggedIn} />
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
