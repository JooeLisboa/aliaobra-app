
'use client';

import { useState, useTransition, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getService, getProposalsForService } from '@/lib/data';
import type { Service, Proposal } from '@/lib/types';
import { LoaderCircle, User, Calendar, Tag, DollarSign, Edit, Send, Check, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-user';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createProposal, acceptProposal } from '@/lib/service-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function ProposalForm({ serviceId }: { serviceId: string; }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            
            const result = await createProposal(serviceId, formData);

            if (result.success) {
                toast({ title: 'Proposta Enviada!', description: 'O cliente foi notificado.' });
                setOpen(false);
            } else {
                toast({ variant: 'destructive', title: 'Erro ao Enviar Proposta', description: result.error });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full">
                    <Send className="mr-2 h-4 w-4" /> Enviar Proposta
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enviar Proposta</DialogTitle>
                    <DialogDescription>
                        Descreva porque você é a pessoa certa para este trabalho e informe sua proposta de valor.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Sua proposta (R$)</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" placeholder="350,00" required disabled={isPending} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">Mensagem</Label>
                            <Textarea id="message" name="message" placeholder="Olá, tenho experiência com este tipo de serviço..." required className="min-h-[120px]" disabled={isPending} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Proposta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export default function ServiceDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { user, isLoading: isUserLoading } = useUser();
    const [isAccepting, startAcceptance] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const service = use(getService(id));
    const proposals = use(getProposalsForService(id));

    if (!service) {
        return notFound();
    }
    
    const handleAcceptProposal = (proposal: Proposal) => {
      if (!user) return;
      if (user.uid !== service.clientId) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você não tem permissão para aceitar propostas para este serviço.' });
        return;
      }
      startAcceptance(async () => {
        const result = await acceptProposal({
          serviceId: service.id,
          proposalId: proposal.id,
          providerId: proposal.providerId,
        });

        if (result.success) {
          toast({ title: 'Proposta Aceita!', description: 'O profissional foi notificado e o serviço iniciado.' });
          router.refresh();
        } else {
          toast({ variant: 'destructive', title: 'Erro', description: result.error });
        }
      });
    };

    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <LoaderCircle className="w-8 h-8 animate-spin" />
            </div>
        );
    }
    
    const isOwner = user && user.uid === service.clientId;
    const isProvider = user?.profile?.userType === 'provider' || user?.profile?.userType === 'agency';
    const hasAlreadyProposed = user && proposals.some(p => p.providerId === user.uid);
    const isSubscriber = isProvider && (user?.subscription?.status === 'active' || user?.subscription?.status === 'trialing');
    const serviceProvider = proposals.find(p => p.providerId === service.assignedProviderId);
    
    return (
        <div className="container mx-auto max-w-4xl py-12">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant={service.status === 'open' ? 'secondary' : 'default'} className="mb-2">
                                {service.status === 'open' ? 'Aberto' : service.status === 'in_progress' ? 'Em Andamento' : 'Concluído'}
                            </Badge>
                            <CardTitle className="text-3xl">{service.title}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> Publicado por {service.clientName}</span>
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {format(new Date(service.createdAt), 'dd/MM/yyyy')}</span>
                            </CardDescription>
                        </div>
                         {isOwner && service.status === 'open' && (
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4"/> Editar
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                           <Tag className="w-6 h-6 text-primary" />
                           <div>
                             <p className="text-sm text-muted-foreground">Categoria</p>
                             <p className="font-semibold">{service.category}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                           <DollarSign className="w-6 h-6 text-primary" />
                           <div>
                             <p className="text-sm text-muted-foreground">Orçamento</p>
                             <p className="font-semibold">R$ {service.budget.toLocaleString('pt-BR')}</p>
                           </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Descrição do Serviço</h3>
                        <p className="text-foreground/80 whitespace-pre-wrap">{service.description}</p>
                    </div>
                    
                     <div className="pt-6 border-t">
                        <h3 className="text-xl font-semibold mb-4">
                          {isOwner || service.status !== 'open' ? 'Propostas' : 'Proponha sua Oferta'}
                        </h3>
                         {service.status === 'in_progress' && service.assignedProviderId && serviceProvider ? (
                            <Card>
                               <CardHeader>
                                  <CardTitle>Serviço em andamento com:</CardTitle>
                               </CardHeader>
                               <CardContent>
                                    <Link href={`/providers/${service.assignedProviderId}`} className="flex items-center gap-3 hover:bg-muted p-2 rounded-md">
                                        <Avatar>
                                            <AvatarImage src={serviceProvider.providerAvatarUrl} />
                                            <AvatarFallback>{serviceProvider.providerName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-primary">{serviceProvider.providerName}</p>
                                            <p className="text-sm text-muted-foreground">Proposta aceita no valor de R$ {service.acceptedProposalAmount?.toLocaleString('pt-BR')}</p>
                                        </div>
                                    </Link>
                               </CardContent>
                            </Card>
                         ) : (
                          <>
                           {isOwner && (
                             proposals.length > 0 ? (
                               <div className="space-y-4">
                                 {proposals.map(proposal => (
                                   <Card key={proposal.id} className="bg-secondary/30">
                                     <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                           <Avatar>
                                              <AvatarImage src={proposal.providerAvatarUrl} alt={proposal.providerName} />
                                              <AvatarFallback>{proposal.providerName.charAt(0)}</AvatarFallback>
                                           </Avatar>
                                           <div className="flex-1">
                                              <Link href={`/providers/${proposal.providerId}`} className="font-bold text-primary hover:underline">{proposal.providerName}</Link>
                                              <p className="text-sm text-muted-foreground line-clamp-2">{proposal.message}</p>
                                           </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Valor Proposto</p>
                                                <p className="text-lg font-bold">R$ {proposal.amount.toLocaleString('pt-BR')}</p>
                                            </div>
                                            <Button onClick={() => handleAcceptProposal(proposal)} disabled={isAccepting}>
                                                {isAccepting ? <LoaderCircle className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>}
                                                Aceitar
                                            </Button>
                                        </div>
                                     </CardContent>
                                   </Card>
                                 ))}
                               </div>
                             ) : (
                               <div className="text-center py-8 bg-muted/50 rounded-lg">
                                  <p className="text-muted-foreground">Aguardando propostas dos profissionais.</p>
                               </div>
                             )
                           )}
                          </>
                         )}
                    </div>
                    
                    {isProvider && !isOwner && service.status === 'open' && (
                        <div className="pt-6 border-t">
                            {hasAlreadyProposed ? (
                                <Alert variant="default">
                                  <Check className="h-4 w-4" />
                                  <AlertTitle>Proposta Enviada!</AlertTitle>
                                  <AlertDescription>
                                    Você já enviou uma proposta para este serviço. O cliente irá analisá-la.
                                  </AlertDescription>
                                </Alert>
                            ) : isSubscriber ? (
                                <ProposalForm serviceId={service.id} />
                            ) : (
                                <Alert variant="default" className="border-primary/50 text-center">
                                    <ShieldAlert className="h-4 w-4" />
                                    <AlertTitle className="font-bold text-primary">Recurso Exclusivo para Assinantes</AlertTitle>
                                    <AlertDescription>
                                        Você precisa de um plano Profissional ou Agência para enviar propostas para os serviços.
                                        <Button asChild size="sm" className="mt-4">
                                            <Link href="/plans">Fazer Upgrade Agora</Link>
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
