"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProviders } from '@/lib/data';
import { ProviderCard } from '@/components/provider-card';
import { Search, LoaderCircle, Building, Users, Star } from 'lucide-react';
import type { Provider } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function Home() {
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [locationSearch, setLocationSearch] = useState<string>('');

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      const providersFromDb = await getProviders();
      setAllProviders(providersFromDb);
      setIsLoading(false);
    };
    fetchProviders();
  }, []);

  const categories = useMemo(() => {
    const allCategories = allProviders.map(p => p.category);
    return ['all', ...Array.from(new Set(allCategories))];
  }, [allProviders]);

  const filteredProviders = useMemo(() => {
    if (isLoading) return [];
    return allProviders.filter(provider => {
      const categoryMatch = selectedCategory === 'all' || provider.category.toLowerCase() === selectedCategory.toLowerCase();
      const locationMatch = locationSearch === '' || provider.location.toLowerCase().includes(locationSearch.toLowerCase());
      return categoryMatch && locationMatch;
    });
  }, [allProviders, selectedCategory, locationSearch, isLoading]);

  return (
    <TooltipProvider>
      <div className="w-full mx-auto">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                  Conectando Talentos à sua Necessidade
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tighter">
                  Encontre o Profissional Certo para seu Projeto
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Busque por pedreiros, pintores, eletricistas e mais. Veja avaliações e portfólios para contratar com segurança.
                </p>
              </div>
               <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero Image"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
                data-ai-hint="construction workers team"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-20">
           <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="p-4 sm:p-6 rounded-lg shadow-lg -mt-32 mb-12 max-w-4xl mx-auto bg-card">
                <div className="grid sm:grid-cols-2 gap-4 items-end">
                  <div>
                    <label htmlFor="service-category" className="text-sm font-medium text-foreground/90 mb-1 block">
                      Serviço
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoading}>
                      <SelectTrigger id="service-category" className="w-full">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category === 'all' ? 'Todas as categorias' : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="location" className="text-sm font-medium text-foreground/90 mb-1 block">Localização</label>
                    <Input 
                      id="location" 
                      placeholder="Digite a cidade ou estado" 
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </Card>
           </div>
        </section>
        
        <div id="about" className="py-12 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Sobre a ServiçoPro</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                        Nossa missão é conectar você aos melhores profissionais de forma simples, transparente e segura.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <Card className="p-6">
                        <CardHeader className="flex flex-col items-center">
                            <Building className="w-12 h-12 text-primary mb-4" />
                            <h3 className="text-xl font-semibold">Para Clientes</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Encontre profissionais qualificados, veja portfólios reais e leia avaliações de outros clientes para contratar com confiança.</p>
                        </CardContent>
                    </Card>
                     <Card className="p-6">
                        <CardHeader className="flex flex-col items-center">
                            <Users className="w-12 h-12 text-primary mb-4" />
                            <h3 className="text-xl font-semibold">Para Profissionais</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Crie um perfil, exiba seus melhores trabalhos, receba avaliações e aumente sua visibilidade para conquistar mais clientes.</p>
                        </CardContent>
                    </Card>
                     <Card className="p-6">
                         <CardHeader className="flex flex-col items-center">
                            <Star className="w-12 h-12 text-primary mb-4" />
                            <h3 className="text-xl font-semibold">Qualidade e Segurança</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Verificamos perfis e usamos um sistema de avaliação robusto para construir uma comunidade de confiança e excelência.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <LoaderCircle className="w-8 h-8 animate-spin mr-4" />
              Carregando profissionais...
            </div>
          ) : filteredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
                <Search className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum profissional encontrado</h3>
                <p className="mt-2 text-sm">
                    Tente ajustar seus filtros de busca ou verifique se há profissionais cadastrados no banco de dados.
                </p>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
