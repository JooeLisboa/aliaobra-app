
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProvider, getProvidersByIds } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating } from '@/components/star-rating';
import { ReviewCard } from '@/components/review-card';
import { Clock, CheckCircle, MapPin, MessageSquare, Phone, Briefcase, Users, Send, LoaderCircle, ShieldCheck, Info } from 'lucide-react';
import { ReviewForm } from '@/components/review-form';
import { ProviderCard } from '@/components/provider-card';
import type { PortfolioItem, Provider } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { startChat } from '@/lib/chat-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PlasticHelmet = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.5V6.5A4.5 4.5 0 0 0 12 2Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1"/>
        <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V9h9V6.5A4.5 4.5 0 0 0 12 2Z" fill="#FCD34D" />
    </svg>
);

const GoldHelmet = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#gold-gradient)" className={className}>
    <defs>
      <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>
    <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.5V6.5A4.5 4.5 0 0 0 12 2Z" stroke="#DAA520" strokeWidth="0.5"/>
  </svg>
);

const EmeraldHelmet = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#emerald-gradient)" className={className}>
    <defs>
      <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="50%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.5V6.5A4.5 4.5 0 0 0 12 2Z" stroke="#065F46" strokeWidth="0.5"/>
  </svg>
);

function PlanIcon({ plan, className }: { plan?: Provider['plan'], className?: string }) {
    if (!plan) return null;

    const iconMap = {
        'Básico': {
            icon: <PlasticHelmet className={className} />,
            tooltip: 'Plano Básico',
        },
        'Profissional': {
            icon: <GoldHelmet className={className} />,
            tooltip: 'Assinante: Plano Profissional',
        },
        'Agência': {
            icon: <EmeraldHelmet className={className} />,
            tooltip: 'Assinante: Plano Agência',
        },
    };

    const iconData = iconMap[plan];
    if (!iconData) return null;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span>{iconData.icon}</span>
            </TooltipTrigger>
            <TooltipContent>
                <p>{iconData.tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}


export default function ProviderProfilePage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const { user } = useUser();
  const router = useRouter();
  const { id } = params;

  const [messageOpen, setMessageOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [providerData, setProviderData] = useState<Provider | null>();
  const [managedProviders, setManagedProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!id) return;
    const fetchProviderData = async () => {
      setIsLoading(true);
      const foundProvider = await getProvider(id);
      setProviderData(foundProvider || null);

      if (foundProvider && foundProvider.type === 'agency' && foundProvider.managedProviderIds) {
        const managed = await getProvidersByIds(foundProvider.managedProviderIds);
        setManagedProviders(managed);
      }
      setIsLoading(false);
    };

    fetchProviderData();
  }, [id]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    if (!providerData || !user) {
        toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para enviar uma mensagem." });
        return;
    };

    setIsSendingMessage(true);
    formData.append('providerId', providerData.id);
    // SECURITY: Pass only the client's ID. The server action will fetch the user's profile info.
    formData.append('clientId', user.uid);
    
    const result = await startChat(formData);
    
    if (result.success && result.chatId) {
        toast({
            title: "Conversa iniciada!",
            description: "Você será redirecionado para o chat.",
        });
        setMessageOpen(false);
        router.push(`/chat/${result.chatId}`);
    } else {
        toast({
            variant: "destructive",
            title: "Erro ao enviar mensagem",
            description: result.error,
        });
    }
    setIsSendingMessage(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          <LoaderCircle className="w-8 h-8 animate-spin mr-4" />
          Carregando perfil...
        </div>
      </div>
    );
  }

  // Not found state
  if (!providerData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold">404 - Profissional Não Encontrado</h1>
        <p className="mt-4 text-lg text-muted-foreground">O profissional que você está procurando não existe ou foi removido.</p>
        <Button asChild className="mt-8">
          <Link href="/">Voltar para a Página Inicial</Link>
        </Button>
      </div>
    );
  }
  
  const isOwner = user && user.uid === providerData.id;
  const isAgency = providerData.type === 'agency';

  const agencyPortfolio: PortfolioItem[] = isAgency
    ? managedProviders.flatMap(p => p.portfolio)
    : providerData.portfolio;
  
  const sendMessageTrigger = (
      <Button variant="secondary" className="w-full" size="lg" disabled={!user || isOwner}>
        <MessageSquare className="mr-2"/> Enviar mensagem
      </Button>
  );

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="flex flex-col items-center text-center p-6">
                <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
                  <AvatarImage src={providerData.avatarUrl} alt={providerData.name} />
                  <AvatarFallback>{providerData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{providerData.name}</h1>
                  <PlanIcon plan={providerData.plan} className="w-6 h-6" />
                  {providerData.isVerified && (
                    <Tooltip>
                      <TooltipTrigger>
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Profissional Verificado</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {isAgency && <Briefcase className="w-6 h-6 text-primary" />}
                </div>
                <p className="text-muted-foreground">{providerData.category}</p>
                
                {!isAgency && providerData.agency && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Membro da <Link href={`/providers/${providerData.agency.id}`} className="text-primary hover:underline font-semibold">{providerData.agency.name}</Link>
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={providerData.rating} readOnly />
                  <span className="text-sm text-muted-foreground">({providerData.reviewCount} avaliações)</span>
                </div>
              </CardHeader>
              <CardContent className="text-sm p-6">
                  <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span>{providerData.location}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4 font-semibold">
                      {providerData.status === 'Disponível' ? 
                          <><CheckCircle className="w-5 h-5 text-green-600" /> <span className="text-green-600">Disponível</span></> : 
                          <><Clock className="w-5 h-5 text-orange-500" /> <span className="text-orange-500">Em Serviço</span></>
                      }
                  </div>
                
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button className="w-full" size="lg"><Phone className="mr-2"/> Ligar</Button>
                    <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                      <DialogTrigger asChild>
                          {user && !isOwner ? (
                            sendMessageTrigger
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                  <span tabIndex={0}>{sendMessageTrigger}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isOwner ? "Você não pode enviar uma mensagem para si mesmo." : "Faça login para enviar uma mensagem."}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                          <DialogTitle>Enviar mensagem para {providerData.name}</DialogTitle>
                          <DialogDescription>
                            Descreva o serviço que você precisa. O prestador receberá sua mensagem e poderão conversar.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSendMessage}>
                          <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="message">Sua Mensagem</Label>
                                <Textarea id="message" name="initialMessage" placeholder="Olá, gostaria de um orçamento para..." className="min-h-[120px]" required disabled={isSendingMessage} />
                              </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={isSendingMessage}>
                                {isSendingMessage ? <LoaderCircle className="animate-spin" /> : <Send />}
                                {isSendingMessage ? 'Enviando...' : 'Enviar Mensagem'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
             <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle className="font-semibold">Lembrete Importante</AlertTitle>
                <AlertDescription>
                  A AliaObra é uma plataforma para facilitar o contato. Toda negociação, serviço e pagamento é de responsabilidade exclusiva entre você e o profissional.
                </AlertDescription>
            </Alert>
             <Tabs defaultValue={isAgency ? "professionals" : "portfolio"}>
              <TabsList className={`grid w-full ${isAgency ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {isAgency && <TabsTrigger value="professionals">Profissionais</TabsTrigger>}
                <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
                <TabsTrigger value="about">Sobre</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              </TabsList>

              {isAgency && (
                <TabsContent value="professionals" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users />
                        Profissionais Gerenciados
                      </CardTitle>
                      <CardDescription>
                        {managedProviders.length} profissionais na equipe da {providerData.name}.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {managedProviders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {managedProviders.map((p) => (
                            <ProviderCard key={p.id} provider={p} />
                          ))}
                        </div>
                      ) : (
                         <p className="text-muted-foreground">Nenhum profissional na equipe ainda.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="portfolio" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{isAgency ? 'Portfólio da Equipe' : 'Trabalhos Realizados'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {agencyPortfolio.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {agencyPortfolio.map((item) => (
                          <Dialog key={item.id}>
                            <DialogTrigger asChild>
                              <div className="group relative cursor-pointer">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.description}
                                  width={400}
                                  height={300}
                                  className="rounded-lg object-cover aspect-square transition-transform group-hover:scale-105"
                                  data-ai-hint={item['data-ai-hint']}
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-white text-center p-2">{item.description}</p>
                                </div>
                              </div>
                            </DialogTrigger>
                             <DialogContent className="max-w-3xl">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.description}
                                    width={800}
                                    height={600}
                                    className="rounded-lg object-contain"
                                    data-ai-hint={item['data-ai-hint']}
                                />
                                 <DialogHeader>
                                    <DialogTitle>{item.description}</DialogTitle>
                                 </DialogHeader>
                             </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Nenhum trabalho no portfólio ainda.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre {providerData.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Biografia</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{providerData.bio}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Especialidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {providerData.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Avaliações de Clientes</CardTitle>
                    <ReviewForm providerId={providerData.id} />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {providerData.reviews.length > 0 ? (
                      providerData.reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))
                    ) : (
                      <p className="text-muted-foreground">Nenhuma avaliação ainda.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
