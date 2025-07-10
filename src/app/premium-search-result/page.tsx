// src/app/premium-search-result/page.tsx
'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Wand2, SearchX } from 'lucide-react';
import { findBestProviderForProject } from '../premium-search-actions';
import { useToast } from '@/hooks/use-toast';
import { ProviderCard } from '@/components/provider-card';
import type { Provider } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TooltipProvider } from '@/components/ui/tooltip';

function PremiumSearchResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const description = searchParams.get('description');
    
    if (!description) {
      toast({
        variant: 'destructive',
        title: 'Descrição do projeto não encontrada.',
        description: 'Você será redirecionado para iniciar a busca novamente.',
      });
      router.replace('/premium-search');
      return;
    }

    startTransition(async () => {
      setError(null);
      const res = await findBestProviderForProject(description);
      if (res.success && res.provider) {
        setResult(res.provider);
      } else {
        setError(res.error || 'Não foi possível encontrar um profissional compatível. Tente refinar sua busca.');
      }
    });
  }, [searchParams, router, toast]);

  if (isPending) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
              Analisando seu projeto...
            </CardTitle>
            <CardDescription>
              Nossa IA está cruzando as informações do seu projeto com os perfis de nossos melhores profissionais. Isso pode levar um momento.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader className="items-center text-center">
          <Wand2 className="w-12 h-12 text-primary" />
          <CardTitle className="text-2xl mt-2">Recomendação da IA</CardTitle>
          {result && (
            <CardDescription>
              Com base na sua descrição, encontramos o profissional que melhor se encaixa no seu projeto.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {result ? (
            <TooltipProvider>
                <ProviderCard provider={result} />
            </TooltipProvider>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              <SearchX className="mx-auto h-16 w-16 mb-4" />
              <h3 className="text-xl font-semibold text-foreground">Nenhum Profissional Encontrado</h3>
              <p className="mt-2">{error}</p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/premium-search">Tentar Novamente</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function PremiumSearchResultPage() {
  return (
    <Suspense>
        <PremiumSearchResultContent />
    </Suspense>
  )
}
