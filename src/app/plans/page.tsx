
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Info, LoaderCircle, PackageSearch, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { StripeProduct } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getActiveProductsWithPrices } from '@/lib/data';
import { TooltipProvider } from '@/components/ui/tooltip';
import { loadStripe } from '@stripe/stripe-js';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const staticPlans = [
  {
    id: 'static-basico',
    name: 'Básico',
    description: 'Para quem está começando e quer ter uma presença na plataforma.',
    price: '5,97',
    features: [
      'Criação de perfil completo',
      'Visibilidade na busca de profissionais',
      'Recebimento de contatos diretos',
    ],
    isFeatured: false,
  },
  {
    id: 'static-profissional',
    name: 'Profissional',
    description: 'Ideal para profissionais que buscam ativamente por novos trabalhos.',
    price: '29,97',
    features: [
      'Todos os benefícios do Básico',
      'Envio de propostas para serviços',
      'Perfil com destaque nos resultados',
      'Selo de Assinante no perfil',
    ],
    isFeatured: true,
  },
  {
    id: 'static-agencia',
    name: 'Agência',
    description: 'Para empresas e equipes que gerenciam múltiplos profissionais.',
    price: '69,97',
    features: [
      'Todos os benefícios do Profissional',
      'Gerenciamento de até 5 perfis',
      'Painel de controle para a agência',
      'Suporte prioritário',
    ],
    isFeatured: false,
  },
];


export default function PlansPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      const prods = await getActiveProductsWithPrices();
      prods.forEach(p => p.prices.sort((a,b) => (a.unit_amount ?? 0) - (b.unit_amount ?? 0)));
      prods.sort((a,b) => {
        const aPrice = a.prices.find(p => p.type === 'recurring')?.unit_amount ?? Infinity;
        const bPrice = b.prices.find(p => p.type === 'recurring')?.unit_amount ?? Infinity;
        return aPrice - bPrice;
      });
      setProducts(prods);
      setIsLoadingProducts(false);
    }
    fetchProducts();
  }, []);

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      router.push(`/signup?redirect=/plans`);
      return;
    }
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        toast({ variant: 'destructive', title: 'Erro de Configuração', description: 'A chave publicável do Stripe não está configurada.' });
        return;
    }

    setIsRedirecting(priceId);

    try {
        const checkoutSessionRef = collection(db, 'customers', user.uid, 'checkout_sessions');
        const docRef = await addDoc(checkoutSessionRef, {
            price: priceId,
            success_url: `${window.location.origin}/profile/edit?plan_success=true`,
            cancel_url: window.location.origin,
            allow_promotion_codes: true,
        });

        onSnapshot(docRef, async (snap) => {
            const { error, sessionId } = snap.data() || {};
            if (error) {
                toast({ variant: 'destructive', title: 'Erro no Pagamento', description: error.message });
                console.error(error);
                setIsRedirecting(null);
                return;
            }
            if (sessionId) {
                const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
                if (stripe) {
                    await stripe.redirectToCheckout({ sessionId });
                } else {
                    toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o Stripe.' });
                    setIsRedirecting(null);
                }
            }
        });
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível iniciar o checkout. Tente novamente.' });
        console.error(error);
        setIsRedirecting(null);
    }
  };
  
  const getButtonState = (product: StripeProduct) => {
    const price = product.prices.find(p => p.type === 'recurring');
    if (!price) return { text: 'Indisponível', disabled: true, variant: 'secondary' as 'secondary' };

    if (!user) {
        return { text: 'Assinar Agora', disabled: false, variant: product.metadata?.isFeatured ? 'default' : 'outline' as 'default' | 'outline' };
    }
    
    if (user.subscription?.product?.id === product.id) {
        return { text: 'Seu Plano Atual', disabled: true, variant: 'secondary' as 'secondary' };
    }
    
    return { text: 'Fazer Upgrade', disabled: false, variant: product.metadata?.isFeatured ? 'default' : 'outline' as 'default' | 'outline' };
  };

  const isLoading = isUserLoading || isLoadingProducts;
  const displayableProducts = products.filter(p => p.prices.some(price => price.type === 'recurring'));

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex flex-col"><CardHeader><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-3/4 mt-2" /></CardHeader><CardContent className="flex-grow space-y-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></CardContent><CardFooter><Skeleton className="h-11 w-full" /></CardFooter></Card>
      ));
    }

    if (displayableProducts.length > 0) {
      return displayableProducts.map((product) => {
        const buttonState = getButtonState(product);
        const price = product.prices.find(p => p.type === 'recurring')!;

        return (
          <Card key={product.id} className={`flex flex-col ${product.metadata?.isFeatured ? 'border-primary shadow-lg' : ''}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">
                  {(price.unit_amount! / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                {price.recurring && <span className="text-muted-foreground">/{price.recurring.interval}</span>}
              </div>
              <ul className="space-y-3">
                {(product.metadata?.features ?? '').split(',').map((feature: string) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" />
                    <span className="text-sm text-foreground/90">{feature.trim()}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg" 
                variant={buttonState.variant} 
                disabled={buttonState.disabled || !!isRedirecting}
                onClick={() => handleCheckout(price.id)}
              >
                {isRedirecting === price.id && <LoaderCircle className="animate-spin mr-2" />}
                {isRedirecting === price.id ? 'Aguarde...' : buttonState.text}
              </Button>
            </CardFooter>
          </Card>
        );
      });
    }

    // Static fallback / guide
    return (
      <>
        {staticPlans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col ${plan.isFeatured ? 'border-primary shadow-lg' : ''}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">
                  R$ {plan.price}
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" />
                    <span className="text-sm text-foreground/90">{feature.trim()}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" variant={plan.isFeatured ? 'default' : 'outline'} disabled>
                Assinar Agora
              </Button>
            </CardFooter>
          </Card>
        ))}
        <Card className="md:col-span-3">
            <CardHeader>
                <PackageSearch className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <CardTitle className="text-2xl text-center">Nenhum Plano Ativo Encontrado</CardTitle>
                <CardDescription className="text-center">
                    Os planos acima são um exemplo. Para ativar os pagamentos, siga os passos abaixo.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-left space-y-3 max-w-md mx-auto">
                <p>1. Acesse seu <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold">Painel do Stripe</a>.</p>
                <p>2. Crie os produtos para cada plano (ex: "Plano Profissional").</p>
                <p>3. Adicione um preço a cada produto, garantindo que seja <strong>Recorrente</strong>.</p>
                <p>4. Em "Metadados", adicione a chave `firebaseRole` com o valor correspondente (ex: `profissional`).</p>
                <p>5. Após salvar, a extensão do Stripe irá sincronizar os dados e os planos aparecerão aqui.</p>
            </CardContent>
        </Card>
      </>
    );
  };

  return (
    <TooltipProvider>
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
            <Star className="h-4 w-4 !text-primary" />
            <AlertTitle className="text-primary font-bold">Destaque-se na multidão!</AlertTitle>
            <AlertDescription className="text-foreground/80">
                Assine um de nossos planos e ganhe um selo de verificação, envie propostas e apareça no topo das buscas.
            </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {renderContent()}
        </div>

        <Card className="max-w-6xl mx-auto mt-12 text-center">
          <CardHeader>
             <CardTitle className="text-2xl flex items-center justify-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                Plano Corporativo
             </CardTitle>
             <CardDescription>
                Tem uma agência com mais de 5 funcionários ou necessidades específicas?
             </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground mb-4">
                Oferecemos soluções personalizadas para grandes equipes, com gerenciamento avançado, relatórios e suporte dedicado.
             </p>
             <Button size="lg">
                Entre em Contato <ArrowRight className="ml-2" />
             </Button>
          </CardContent>
        </Card>

      </div>
    </TooltipProvider>
  );
}
