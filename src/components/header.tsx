"use client";

import Link from "next/link";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { Wrench, Home, ClipboardList, Info, MessageSquare, Briefcase } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { AuthStatus } from "./auth-status";


const AppLogo = ({ className }: { className?: string }) => (
  <Link href="/" className={cn("flex items-center gap-2", className)} prefetch={false}>
    <Wrench className="h-7 w-7 text-primary" />
    <span className="text-xl font-bold text-primary tracking-tighter group-data-[collapsible=icon]:hidden">
      AliaObra
    </span>
  </Link>
);


export function MainSidebar() {
  const { user } = useUser();
  const isLoggedIn = !!user;

  return (
      <Sidebar collapsible="icon">
        <SidebarHeader className="justify-between">
          <AppLogo />
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{children: 'Início', side: 'right'}}>
                <Link href="/"><Home /><span>Início</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{children: 'Serviços', side: 'right'}}>
                <Link href="/services"><Briefcase /><span>Serviços</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{children: 'Planos', side: 'right'}}>
                <Link href="/plans"><ClipboardList /><span>Planos</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{children: 'Sobre Nós', side: 'right'}}>
                <Link href="/#about"><Info /><span>Sobre Nós</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isLoggedIn && (
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: 'Mensagens', side: 'right'}}>
                  <Link href="/chat"><MessageSquare /><span>Mensagens</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="mt-auto border-t p-2">
          <AuthStatus />
        </SidebarFooter>
      </Sidebar>
  );
}
