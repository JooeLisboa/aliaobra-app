import { MessageSquareText } from 'lucide-react';

export default function ChatListPage() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center text-center p-8 bg-muted/50 h-full">
             <MessageSquareText className="w-24 h-24 text-muted-foreground/30 mb-4" />
            <h2 className="text-2xl font-bold">Selecione uma conversa</h2>
            <p className="text-muted-foreground">Escolha uma conversa na lista para ver as mensagens.</p>
        </div>
    );
}
