
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Info, LoaderCircle, Users, Star, ArrowRight } from 'lucide-react';
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
import { useRouter, useSearchParams } from 'next/navigation';


export default function PlansPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const prods = await getActiveProductsWithPrices();
        prods.forEach(p => p.prices.sort((a,b) => (a.unit_amount ?? 0) - (b.unit_amount ?? 0)));
        prods.sort((a,b) => {
          const aPrice = a.prices.find(p => p.type === 'recurring')?.unit_amount ?? Infinity;
          const bPrice = b.prices.find(p => p.type === 'recurring')?.unit_amount ?? Infinity;
          return aPrice - bPrice;
        });
        setProducts(prods);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({ variant: 'destructive', title: 'Erro ao carregar planos', description: 'Não foi possível buscar os planos de assinatura. Tente novamente mais tarde.'});
      } finally {
        setIsLoadingProducts(false);
      }
    }
    if (!isUserLoading) {
      fetchProducts();
    }
  }, [isUserLoading, toast]);
  
  useEffect(() => {
    if (searchParams?.get('plan_success')) {
        toast({
            title: "Assinatura Ativada!",
            description: "Seu plano foi atualizado com sucesso.",
        });
        router.replace('/profile/edit', { scroll: false });
    }
  }, [router, toast, searchParams]);


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
        return { text: 'Assinar Agora', disabled: false, variant: product.metadata?.isFeatured === 'true' ? 'default' : 'outline' as 'default' | 'outline' };
    }
    
    if (user.subscription?.product?.id === product.id) {
        return { text: 'Seu Plano Atual', disabled: true, variant: 'secondary' as 'secondary' };
    }
    
    return { text: 'Fazer Upgrade', disabled: false, variant: product.metadata?.isFeatured === 'true' ? 'default' : 'outline' as 'default' | 'outline' };
  };

  const isLoading = isUserLoading || isLoadingProducts;
  const displayableProducts = products.filter(p => p.prices.some(price => price.type === 'recurring'));

  const renderPlanCard = (product: StripeProduct) => {
    const priceInfo = product.prices.find((p) => p.recurring);
    const buttonState = getButtonState(product);
    // It's safe to assume priceInfo and its id exist due to 'displayableProducts' filter
    const priceId = priceInfo!.id; 
    const isFeatured = product.metadata?.isFeatured === 'true';

    return (
      <Card key={product.id} className={`flex flex-col ${isFeatured ? 'border-primary shadow-lg' : ''}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{product.name}</CardTitle>
          <CardDescription>{product.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold">
              {((priceInfo!.unit_amount ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="text-muted-foreground">/{priceInfo!.recurring?.interval === 'month' ? 'mês' : 'ano'}</span>
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
            onClick={() => handleCheckout(priceId)}
          >
            {isRedirecting === priceId && <LoaderCircle className="animate-spin mr-2" />}
            {isRedirecting === priceId ? 'Aguarde...' : buttonState.text}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex flex-col"><CardHeader><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-3/4 mt-2" /></CardHeader><CardContent className="flex-grow space-y-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></CardContent><CardFooter><Skeleton className="h-11 w-full" /></CardFooter></Card>
      ));
    }

    if (displayableProducts.length > 0) {
      return displayableProducts.map((product) => renderPlanCard(product));
    }
    
    // Fallback content when no products are found from Stripe, showing placeholders.
    return (
      <>
        <Card className="flex flex-col">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Plano Básico</CardTitle>
                <CardDescription>Visibilidade na plataforma e perfil público.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-center mb-6">
                    <span className="text-4xl font-bold">R$ 5,97</span>
                    <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-start"><Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" /><span>Perfil público na plataforma</span></li>
                    <li className="flex items-start"><Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" /><span>Receber avaliações de clientes</span></li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" variant="outline" disabled>Sincronizando...</Button>
            </CardFooter>
        </Card>

        <Card className="flex flex-col border-primary shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Plano Profissional</CardTitle>
                <CardDescription>Destaque na busca e envio de propostas.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-center mb-6">
                    <span className="text-4xl font-bold">R$ 29,97</span>
                    <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-start"><Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" /><span>Todos os benefícios do Básico</span></li>
                    <li className="flex items-start"><Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" /><span>Envio de propostas para serviços</span></li>
                    <li className="flex items-start"><Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" /><span>Selo de Assinante no perfil</span></li>
                    <li className="flex items-start"><Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" /><span>Melhor posicionamento nas buscas</span></li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" disabled>Sincronizando...</Button>
            </CardFooter>
        </Card>

        <Card className="flex flex-col">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Plano Agência</CardTitle>
                <CardDescription>Gerenciamento de múltiplos profissionais.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-center mb-6">
                    <span className="text-4xl font-bold">R$ 69,97</span>
                    <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-start"><Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" /><span>Todos os benefícios do Profissional</span></li>
                    <li className="flex items-start"><Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" /><span>Gerenciamento de até 5 profissionais</span></li>
                    <li className="flex items-start"><Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-1" /><span>Perfil de agência destacado</span></li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" variant="outline" disabled>Sincronizando...</Button>
            </CardFooter>
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
        
        {displayableProducts.length === 0 && !isLoading && (
             <Alert className="max-w-4xl mx-auto mt-12">
              <Info className="h-4 w-4" />
              <AlertTitle>Aguardando Sincronização com o Stripe</AlertTitle>
              <AlertDescription>
                Seus planos criados no painel do Stripe ainda não apareceram. Isso geralmente acontece por um atraso na comunicação ou um problema com os Webhooks. 
                <br/><br/>
                **Ação Recomendada:** Verifique seus <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold">Webhooks no Stripe</a> para garantir que os eventos (`product.created`, `price.created`, etc) estão sendo enviados corretamente.
              </AlertDescription>
            </Alert>
        )}

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
