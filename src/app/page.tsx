"use client";

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProviders } from '@/lib/data';
import { ProviderCard } from '@/components/provider-card';
import { Search, LoaderCircle } from 'lucide-react';
import type { Provider } from '@/lib/types';

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
    // Use 'new Set' to get unique categories and add 'all' at the beginning
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 tracking-tight">
          Encontre o Profissional Certo
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
          Busque por pedreiros, pintores, eletricistas e mais. Veja avaliações e portfólios para contratar com segurança.
        </p>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md mb-12 max-w-4xl mx-auto">
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
      </div>

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
  );
}
