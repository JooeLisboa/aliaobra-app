'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserChats } from '@/lib/chat-actions';
import { useUser } from '@/lib/hooks/use-user';
import type { Chat } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoaderCircle, MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

function ChatSidebar({ chats, currentUserId }: { chats: Chat[], currentUserId: string }) {
    const pathname = usePathname();

    if (chats.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                <MessageSquareText className="w-12 h-12 mx-auto mb-4" />
                <p>Nenhuma conversa iniciada.</p>
                <p className="text-sm">Inicie uma conversa na página de um profissional.</p>
            </div>
        );
    }
    return (
        <nav className="flex flex-col gap-1 p-2">
            {chats.map(chat => {
                const otherParticipantId = chat.participantIds.find(id => id !== currentUserId)!;
                const otherParticipant = chat.participantInfo[otherParticipantId];
                const isActive = pathname === `/chat/${chat.id}`;

                return (
                    <Link
                        key={chat.id}
                        href={`/chat/${chat.id}`}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors",
                          isActive && "bg-muted"
                        )}
                    >
                        <Avatar>
                            <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} />
                            <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                            <p className="font-semibold truncate">{otherParticipant.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage?.text}</p>
                        </div>
                        {chat.lastMessage?.timestamp && (
                           <time className="text-xs text-muted-foreground self-start shrink-0">
                                {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true, locale: ptBR })}
                           </time>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}


export default function ChatListPage() {
    const { user, isLoading: isUserLoading } = useUser();
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getUserChats(user.uid).then(userChats => {
                setChats(userChats);
                setIsLoading(false);
            });
        } else if (!isUserLoading) {
            setIsLoading(false);
        }
    }, [user, isUserLoading]);

    if (isUserLoading || isLoading) {
        return (
            <div className="w-full flex items-center justify-center">
                <LoaderCircle className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    if (!user) {
         return (
             <div className="w-full p-8">
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
         )
    }

    return (
        <>
            <aside className="w-full md:w-1/3 lg:w-1/4 border-r overflow-y-auto">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Conversas</h2>
                </div>
                <ChatSidebar chats={chats} currentUserId={user.uid} />
            </aside>
            <main className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-muted/50">
                 <MessageSquareText className="w-24 h-24 text-muted-foreground/30 mb-4" />
                <h2 className="text-2xl font-bold">Selecione uma conversa</h2>
                <p className="text-muted-foreground">Escolha uma conversa na lista para ver as mensagens.</p>
            </main>
        </>
    );
}
