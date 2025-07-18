"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, UserCircle, LayoutDashboard, UserPlus, LogIn, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Provider } from '@/lib/types';

export function AuthStatus() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        toast({
          title: "Desconectado",
          description: "Você saiu da sua conta com sucesso.",
        });
        router.push('/');
        router.refresh(); // Force a refresh to ensure state is cleared everywhere
      } catch (error) {
        console.error("Error signing out: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Sair",
            description: "Não foi possível desconectar. Tente novamente.",
        });
      }
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex flex-col gap-2 w-full group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
  }

  if (user) {
    let avatarUrl = user.photoURL ?? '';
    const profileName = user.profile?.name ?? user.displayName;
    const displayName = profileName || user.email;

    if (user.profile && 'avatarUrl' in user.profile) {
      avatarUrl = (user.profile as Provider).avatarUrl;
    }

    const fallback = displayName?.charAt(0).toUpperCase() ?? <UserCircle />;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start h-auto p-1">
              <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl} alt={displayName ?? 'User'} />
                      <AvatarFallback>{fallback}</AvatarFallback>
                  </Avatar>
                  <div className="truncate text-left group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-semibold leading-none truncate">{displayName}</p>
                  </div>
              </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" side="top" sideOffset={12}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild className="cursor-pointer">
             <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Meu Dashboard</span>
             </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild className="cursor-pointer">
             <Link href="/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar Perfil</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button asChild>
        <Link href="/signup" prefetch={false}>
          <UserPlus />
          <span className="group-data-[collapsible=icon]:hidden">Cadastre-se</span>
        </Link>
      </Button>
      <Button variant="secondary" asChild>
        <Link href="/login" prefetch={false}>
          <LogIn />
          <span className="group-data-[collapsible=icon]:hidden">Entrar</span>
        </Link>
      </Button>
    </div>
  );
}
