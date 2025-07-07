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
import { CheckCircle, MapPin, MessageSquare, Phone, Briefcase, Users } from 'lucide-react';
import { ReviewForm } from '@/components/review-form';
import { ProviderCard } from '@/components/provider-card';
import type { PortfolioItem } from '@/lib/types';


export default function ProviderProfilePage({ params }: { params: { id: string } }) {
  const provider = providers.find((p) => p.id === params.id);

  if (!provider) {
    notFound();
  }
  
  const isAgency = provider.type === 'agency';

  const managedProviders = isAgency
    ? providers.filter(p => provider.managedProviderIds?.includes(p.id))
    : [];
  
  const agencyPortfolio: PortfolioItem[] = isAgency
    ? managedProviders.flatMap(p => p.portfolio)
    : provider.portfolio;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="flex flex-col items-center text-center p-6">
              <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
                <AvatarImage src={provider.avatarUrl} alt={provider.name} />
                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{provider.name}</h1>
                {isAgency && <Briefcase className="w-6 h-6 text-primary" />}
              </div>
              <p className="text-muted-foreground">{provider.category}</p>
              
              {!isAgency && provider.agency && (
                <p className="text-sm text-muted-foreground mt-1">
                  Membro da <Link href={`/providers/${provider.agency.id}`} className="text-primary hover:underline font-semibold">{provider.agency.name}</Link>
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={provider.rating} readOnly />
                <span className="text-sm text-muted-foreground">({provider.reviewCount} avaliações)</span>
              </div>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span>{provider.location}</span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-muted-foreground" />
                    <span>{provider.availability}</span>
                </div>
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
                      {managedProviders.length} profissionais na equipe da {provider.name}.
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
                  <CardTitle>Sobre {provider.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Biografia</h3>
                    <p className="text-muted-foreground">{provider.bio}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Especialidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {provider.skills.map((skill) => (
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
                  {provider.reviews.length > 0 ? (
                    provider.reviews.map((review) => (
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
  );
}
