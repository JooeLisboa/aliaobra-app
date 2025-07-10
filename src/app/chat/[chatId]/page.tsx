'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';
import type { ChatMessage, Chat } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, LoaderCircle, ArrowLeft } from 'lucide-react';
import { sendMessageInChat } from '@/lib/chat-actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

function ChatMessages({ messages, currentUserId, chatInfo }: { messages: ChatMessage[], currentUserId: string, chatInfo: Chat }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
                const isCurrentUser = msg.senderId === currentUserId;
                const otherParticipant = chatInfo.participantInfo[msg.senderId];
                const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
                
                return (
                    <div key={msg.id} className={cn("flex items-end gap-2", isCurrentUser && "justify-end")}>
                        {!isCurrentUser && (
                            <div className="w-8 h-8 shrink-0">
                                {showAvatar && otherParticipant &&
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={otherParticipant.avatarUrl} />
                                        <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                }
                            </div>
                        )}
                        <div className={cn(
                            "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg",
                            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">{format(new Date(msg.timestamp), 'HH:mm')}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function ChatRoomPage({ params }: { params: { chatId: string } }) {
    const { user, isLoading: isUserLoading } = useUser();
    const { toast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInfo, setChatInfo] = useState<Chat | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user || !db) {
            if (!isUserLoading) setIsLoading(false);
            return;
        };

        const chatRef = doc(db, 'chats', params.chatId);
        const messagesQuery = query(collection(chatRef, 'messages'), orderBy('timestamp', 'asc'));

        const unsubscribeChat = onSnapshot(chatRef, (doc) => {
             if (doc.exists()) {
                const data = doc.data() as Omit<Chat, 'id'>;
                if (!data.participantIds.includes(user.uid)) {
                     setChatInfo(null);
                     setAccessDenied(true);
                     setIsLoading(false);
                     return;
                }
                setChatInfo({id: doc.id, ...data});
             } else {
                 setChatInfo(null);
                 setAccessDenied(true);
             }
             setIsLoading(false);
        });

        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: (data.timestamp as Timestamp)?.toMillis() || Date.now()
                } as ChatMessage;
            });
            setMessages(newMessages);
        });

        return () => {
            unsubscribeChat();
            unsubscribeMessages();
        };

    }, [params.chatId, user, isUserLoading]);

    const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const messageText = inputRef.current?.value.trim();
        if (!messageText || !user || !chatInfo) return;

        setIsSending(true);
        const formData = new FormData();
        formData.append('chatId', params.chatId);
        formData.append('messageText', messageText);

        // NOTE: senderId is now handled securely on the server action.

        const result = await sendMessageInChat(formData);

        if (result.success) {
            if (inputRef.current) inputRef.current.value = "";
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.error });
        }
        setIsSending(false);
        inputRef.current?.focus();
    };

    if (isLoading || isUserLoading) {
        return <div className="w-full flex-1 flex items-center justify-center"><LoaderCircle className="w-8 h-8 animate-spin" /></div>;
    }

    if (accessDenied || !chatInfo || !user) {
        return <div className="w-full flex-1 flex items-center justify-center p-4">Acesso negado ou a conversa não existe.</div>;
    }

    const otherParticipantId = chatInfo.participantIds.find(id => id !== user.uid)!;
    const otherParticipant = chatInfo.participantInfo[otherParticipantId];
    
    if (!otherParticipant) {
        return <div className="w-full flex-1 flex items-center justify-center p-4">Não foi possível carregar as informações do outro participante.</div>;
    }

    return (
        <main className="w-full flex flex-1 flex-col h-full bg-background">
            <header className="flex items-center gap-3 p-3 border-b">
                 <Button asChild variant="ghost" size="icon" className="md:hidden">
                    <Link href="/chat">
                        <ArrowLeft />
                    </Link>
                </Button>
                <Avatar>
                    <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} />
                    <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-bold">{otherParticipant.name}</h2>
                </div>
            </header>
            
            <ChatMessages messages={messages} currentUserId={user.uid} chatInfo={chatInfo} />

            <footer className="p-3 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input ref={inputRef} placeholder="Digite sua mensagem..." autoComplete="off" disabled={isSending} />
                    <Button type="submit" size="icon" disabled={isSending}>
                        {isSending ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </footer>
        </main>
    );
}
