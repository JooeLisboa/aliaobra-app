import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { providers } from '@/lib/data';
import { ProviderCard } from '@/components/provider-card';
import { Search } from 'lucide-react';

export default function Home() {
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
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="service-category" className="text-sm font-medium text-foreground/90 mb-1 block">Serviço</label>
            <Select>
              <SelectTrigger id="service-category" className="w-full">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pedreiro">Pedreiro</SelectItem>
                <SelectItem value="pintor">Pintor</SelectItem>
                <SelectItem value="eletricista">Eletricista</SelectItem>
                <SelectItem value="encanador">Encanador</SelectItem>
                <SelectItem value="ajudante">Ajudante</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="location" className="text-sm font-medium text-foreground/90 mb-1 block">Localização</label>
            <Input id="location" placeholder="Cidade ou CEP" />
          </div>
        </div>
        <div className="mt-4">
          <Button className="w-full" size="lg">
            <Search className="mr-2" />
            Buscar Profissionais
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Button variant="outline" size="lg">Carregar mais</Button>
      </div>
    </div>
  );
}
