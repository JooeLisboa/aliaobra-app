"use client";

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { providers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating } from '@/components/star-rating';
import { ReviewCard } from '@/components/review-card';
import { Clock, CheckCircle, MapPin, MessageSquare, Phone, Briefcase, Users } from 'lucide-react';
import { ReviewForm } from '@/components/review-form';
import { ProviderCard } from '@/components/provider-card';
import type { PortfolioItem, Provider } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function ProviderProfilePage({ params }: { params: { id: string } }) {
  // We find the provider once and use it as initial state
  const initialProvider = providers.find((p) => p.id === params.id);
  
  const [providerData, setProviderData] = useState<Provider | undefined>(initialProvider);
  const [isClient, setIsClient] = useState(false);

  // This effect runs once on the client to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // This effect sets up a timer to re-render the component and update time-based UI
  useEffect(() => {
    if (providerData?.status === 'Em Serviço') {
      const timer = setInterval(() => {
        // Trigger a re-render to check if the 1-hour mark has passed
        setProviderData(current => current ? { ...current } : undefined);
      }, 1000 * 30); // Check every 30 seconds
      return () => clearInterval(timer);
    }
  }, [providerData]);


  if (!providerData) {
    notFound();
  }
  
  const handleAcceptService = () => {
    setProviderData({
      ...providerData,
      status: 'Em Serviço',
      serviceAcceptedAt: Date.now(),
    });
  };

  const handleFinishService = () => {
    setProviderData({
      ...providerData,
      status: 'Disponível',
      serviceAcceptedAt: undefined, // Clear the timestamp
    });
  };

  const isAgency = providerData.type === 'agency';

  const managedProviders = isAgency
    ? providers.filter(p => providerData.managedProviderIds?.includes(p.id))
    : [];
  
  const agencyPortfolio: PortfolioItem[] = isAgency
    ? managedProviders.flatMap(p => p.portfolio)
    : providerData.portfolio;

  // Logic for the 1-hour delay
  const serviceAcceptedAt = providerData.serviceAcceptedAt || 0;
  const oneHourInMs = 60 * 60 * 1000;
  const timeSinceAccepted = isClient ? Date.now() - serviceAcceptedAt : 0;
  const canFinishService = timeSinceAccepted > oneHourInMs;

  const getRemainingTime = () => {
    if (canFinishService) return '';
    const remainingMs = oneHourInMs - timeSinceAccepted;
    const minutes = Math.ceil(remainingMs / (1000 * 60));
    return `Liberado para finalizar em aprox. ${minutes} min.`;
  };

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
              <CardContent className="text-sm">
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
                
                {isClient && !isAgency && (
                    <div className="w-full mb-2 flex flex-col gap-2">
                      {providerData.status === 'Disponível' ? (
                        <Button onClick={handleAcceptService} className="w-full" size="lg">Aceitar Serviço</Button>
                      ) : (
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            {/* The div wrapper is needed for the tooltip to work on a disabled button */}
                            <div className="w-full">
                              <Button onClick={handleFinishService} disabled={!canFinishService} className="w-full" size="lg">
                                Finalizar Serviço
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {!canFinishService && (
                            <TooltipContent>
                              <p>{getRemainingTime()}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      )}
                    </div>
                  )}

                <Button className="w-full mb-2" size="lg"><Phone className="mr-2"/> Entrar em contato</Button>
                <Button variant="secondary" className="w-full"><MessageSquare className="mr-2"/> Enviar mensagem</Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {managedProviders.map((p) => (
                          <ProviderCard key={p.id} provider={p} />
                        ))}
                      </div>
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
                          <div key={item.id} className="group relative">
                            <Image
                              src={item.imageUrl}
                              alt={item.description}
                              width={400}
                              height={300}
                              className="rounded-lg object-cover aspect-square"
                              data-ai-hint={item['data-ai-hint']}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.description}
                            </div>
                          </div>
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
                      <p className="text-muted-foreground">{providerData.bio}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Especialidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {providerData.skills.map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
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
                    <ReviewForm />
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
