'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { getUserChats } from '@/lib/chat-actions';
import type { Chat } from '@/lib/types';
import { ChatSidebar } from '@/components/chat-sidebar';
import { LoaderCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isUserLoading } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserChats(user.uid).then(userChats => {
        setChats(userChats);
        setIsLoading(false);
      });
    } else if (!isUserLoading) {
      setIsLoading(false);
    }
  }, [user, isUserLoading]);

  const isChatRoomActive = pathname !== '/chat';

  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full flex items-center justify-center h-[calc(100vh-12rem)]">
          <LoaderCircle className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
       <div className="container mx-auto px-4 py-8">
         <Card>
            <CardHeader>
                <CardTitle>Acesso Negado</CardTitle>
                <CardDescription>Você precisa estar logado para ver suas mensagens.</CardDescription>
            </CardHeader>
             <CardContent>
                 <p><Link href="/login" className="text-primary underline">Faça o login</Link> para continuar.</p>
            </CardContent>
         </Card>
       </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card border rounded-lg shadow-sm h-[calc(100vh-12rem)] flex overflow-hidden">
        <aside className={cn(
            "w-full md:w-1/3 lg:w-1/4 border-r flex flex-col",
            isChatRoomActive && "hidden md:flex"
        )}>
           <div className="p-4 border-b shrink-0">
              <h2 className="text-xl font-bold">Conversas</h2>
           </div>
           <div className="overflow-y-auto">
             {isLoading ? (
               <div className="flex items-center justify-center h-full p-4">
                  <LoaderCircle className="w-8 h-8 animate-spin" />
               </div>
             ) : (
               <ChatSidebar chats={chats} currentUserId={user.uid} />
             )}
           </div>
        </aside>
        <main className={cn(
            "flex-1 flex-col",
            isChatRoomActive ? "flex" : "hidden md:flex"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
