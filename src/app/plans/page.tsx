
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Info } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { Provider } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlanIcon } from '@/components/plan-icon';
import { getProvider } from '@/lib/data';

const plans = [
  {
    name: 'Básico',
    id: 'basico',
    price: 'Grátis',
    description: 'Comece a divulgar seu trabalho e a receber avaliações.',
    features: [
      'Perfil público',
      'Até 5 fotos no portfólio',
      'Receber avaliações de clientes',
      'Visibilidade na busca padrão'
    ],
    cta: 'Comece Agora',
  },
  {
    name: 'Profissional',
    id: 'profissional',
    price: 'R$ 29,90',
    priceFrequency: '/mês',
    description: 'Destaque-se da concorrência e consiga mais clientes.',
    features: [
      'Todos os benefícios do Básico',
      'Perfil em destaque nos resultados',
      'Selo de Profissional Verificado',
      'Ícone de Assinante Ouro',
      'Portfólio com até 20 fotos',
      'Suporte prioritário'
    ],
    cta: 'Assinar Agora',
    isFeatured: true
  },
  {
    name: 'Agência',
    id: 'agencia',
    price: 'R$ 79,90',
    priceFrequency: '/mês',
    description: 'Gerencie múltiplos profissionais em uma única conta.',
    features: [
      'Todos os benefícios do Profissional',
      'Gerenciamento de até 10 perfis',
      'Ícone de Agência Esmeralda',
      'Portfólio consolidado da equipe',
      'Painel de controle da agência'
    ],
    cta: 'Contratar Plano',
  }
];

const planHierarchy: Record<string, number> = {
    'Básico': 0,
    'Profissional': 1,
    'Agência': 2,
};

export default function PlansPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoadingProvider, setIsLoadingProvider] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoadingProvider(true);
      getProvider(user.uid).then(providerData => {
        setProvider(providerData);
      }).finally(() => {
        setIsLoadingProvider(false);
      });
    } else if (!isUserLoading) {
      setIsLoadingProvider(false);
    }
  }, [user, isUserLoading]);

  const getButtonState = (planId: 'basico' | 'profissional' | 'agencia') => {
    const planDetails = plans.find(p => p.id === planId)!;
    const targetPlanName = planDetails.name as Provider['plan'];

    if (!user) {
        const href = planId === 'basico' ? '/signup' : `/signup?plan=${planId}`;
        return { href, text: planDetails.cta, disabled: false, variant: planDetails.isFeatured ? 'default' : 'outline' };
    }
    
    // User is logged in, but might not be a provider yet.
    // The checkout flow can now handle creating a provider profile.
    if (!provider) {
       const href = `/checkout?plan=${planId}`;
       return { href, text: "Assinar Agora", disabled: false, variant: planDetails.isFeatured ? 'default' : 'outline' }
    }

    const currentPlanLevel = planHierarchy[provider.plan ?? 'Básico'];
    const targetPlanLevel = planHierarchy[targetPlanName!];

    if (currentPlanLevel === targetPlanLevel) {
      return { href: '#', text: 'Seu Plano Atual', disabled: true, variant: 'secondary' as 'secondary' };
    }

    if (currentPlanLevel > targetPlanLevel) {
      // Downgrade logic can be complex, disable for now.
      return { href: '#', text: 'Fazer Downgrade', disabled: true, variant: 'outline' as 'outline' };
    }

    // Upgrading
    return {
      href: `/checkout?plan=${planId}`,
      text: 'Fazer Upgrade',
      disabled: false,
      variant: planDetails.isFeatured ? 'default' : 'outline',
    };
  };

  const isLoading = isUserLoading || isLoadingProvider;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Escolha o Plano Certo para Você
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
          Planos flexíveis para impulsionar sua carreira ou sua agência na construção civil.
        </p>
      </div>

       <Alert className="max-w-4xl mx-auto mb-12 bg-primary/10 border-primary/20">
          <Info className="h-4 w-4 !text-primary" />
          <AlertTitle className="text-primary font-bold">Destaque-se com Ícones Exclusivos!</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2 text-foreground/80">
              <span>Assine e ganhe um capacete exclusivo ao lado do seu nome!</span>
              <span className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-sm"><PlanIcon plan="Profissional" className="w-6 h-6" /> Ouro</span>
                  <span className="flex items-center gap-1 text-sm"><PlanIcon plan="Agência" className="w-6 h-6" /> Esmeralda</span>
              </span>
          </AlertDescription>
      </Alert>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
           const buttonState = getButtonState(plan.id as any);
           return(
            <Card key={plan.name} className={`flex flex-col ${plan.isFeatured ? 'border-primary shadow-lg' : ''}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.priceFrequency && <span className="text-muted-foreground">{plan.priceFrequency}</span>}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" />
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                 {isLoading ? (
                  <Skeleton className="h-11 w-full" />
                ) : (
                  <Button asChild className="w-full" size="lg" variant={buttonState.variant} disabled={buttonState.disabled}>
                    <Link href={buttonState.href}>{buttonState.text}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
           )
        })}
      </div>
    </div>
  );
}
