'use client';

import Link from 'next/link';
import type { Chat } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function ChatSidebar({ chats, currentUserId }: { chats: Chat[], currentUserId: string }) {
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
