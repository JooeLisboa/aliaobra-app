import Image from 'next/image';
import { notFound } from 'next/navigation';
import { providers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating } from '@/components/star-rating';
import { ReviewCard } from '@/components/review-card';
import { CheckCircle, MapPin, MessageSquare, Phone } from 'lucide-react';
import { ReviewForm } from '@/components/review-form';

export default function ProviderProfilePage({ params }: { params: { id: string } }) {
  const provider = providers.find((p) => p.id === params.id);

  if (!provider) {
    notFound();
  }

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
              <h1 className="text-2xl font-bold">{provider.name}</h1>
              <p className="text-muted-foreground">{provider.category}</p>
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
          <Tabs defaultValue="reviews">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
              <TabsTrigger value="about">Sobre</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>
            <TabsContent value="portfolio" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trabalhos Realizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {provider.portfolio.map((item) => (
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
                    <h3 className="font-semibold text-lg mb-2">Habilidades</h3>
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
                  {provider.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
