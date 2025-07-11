
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
import { addDoc, collection, onSnapshot, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const prods = await getActiveProductsWithPrices();
        const displayableProds = prods.filter(p => p.metadata?.firebaseRole !== 'basico');
        setProducts(displayableProds);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({ variant: 'destructive', title: 'Erro ao carregar planos', description: 'Não foi possível buscar os planos de assinatura. Tente novamente mais tarde.'});
      } finally {
        setIsLoadingProducts(false);
      }
    }
    fetchProducts();
  }, [toast]);
  
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      const product = products.find(p => p.prices.some(pr => pr.id === priceId));
      const planName = product?.metadata?.firebaseRole || '';
      const params = new URLSearchParams();
      params.set('plan', planName);
      params.set('redirect', '/plans');
      router.push(`/login?${params.toString()}`);
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
            payment_method_types: ['card'],
        });

        onSnapshot(docRef, async (snap) => {
            const { error, sessionId } = snap.data() || {};
            if (error) {
                const errorMessage = error.message || 'Ocorreu um erro desconhecido durante o pagamento.';
                toast({ variant: 'destructive', title: 'Erro no Pagamento', description: errorMessage });
                console.error("Stripe checkout error:", errorMessage, error);
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
    if (!price) return { text: 'Indisponível', disabled: true, variant: 'secondary' as const };
    
    const isFeatured = product.metadata?.firebaseRole === 'profissional';
    const buttonVariant = isFeatured ? 'default' : 'outline' as 'default' | 'outline';

    if (isUserLoading) {
      return { text: 'Carregando...', disabled: true, variant: buttonVariant };
    }

    if (!user) {
        return { text: 'Fazer Login para Assinar', disabled: false, variant: buttonVariant };
    }
    
    const currentProductRef = user.subscription?.product as DocumentReference | undefined;
    const isCurrentPlan = currentProductRef?.id === product.id;
    
    if (isCurrentPlan) {
        return { text: 'Seu Plano Atual', disabled: true, variant: 'secondary' as const };
    }
    
    return { text: 'Fazer Upgrade', disabled: false, variant: buttonVariant };
  };

  const renderPlanCard = (product: StripeProduct) => {
    const priceInfo = product.prices.find((p) => p.recurring);
    if (!priceInfo) return null;

    const buttonState = getButtonState(product);
    const isFeatured = product.metadata?.firebaseRole === 'profissional';
    const isRedirectingThisPlan = isRedirecting === priceInfo.id;

    return (
      <Card key={product.id} className={`flex flex-col ${isFeatured ? 'border-primary shadow-lg' : ''}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{product.name}</CardTitle>
          <CardDescription>{product.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold">
              {((priceInfo.unit_amount ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="text-muted-foreground">/{priceInfo.recurring?.interval === 'month' ? 'mês' : 'ano'}</span>
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
            onClick={() => handleCheckout(priceInfo.id)}
          >
            {isRedirectingThisPlan && <LoaderCircle className="animate-spin mr-2" />}
            {isRedirectingThisPlan ? 'Aguarde...' : buttonState.text}
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  const renderFallbackContent = () => (
    <div className="md:col-span-2 lg:col-span-3">
        <Alert className="max-w-4xl mx-auto mt-12">
            <Info className="h-4 w-4" />
            <AlertTitle>Nenhum Plano Ativo Encontrado</AlertTitle>
            <AlertDescription>
                <p>Verifique se você criou produtos com preços ativos no seu painel do Stripe.</p>
                <p className="mt-2">Lembre-se de adicionar o metadado `firebaseRole` em cada produto para que eles sejam sincronizados corretamente com a extensão do Firebase.</p>
                <p className="mt-2">Se os planos não aparecerem, verifique se o webhook do Stripe está configurado corretamente para enviar os eventos de `product.created` e `product.updated` para o Firebase.</p>
            </AlertDescription>
        </Alert>
    </div>
  );

  const renderContent = () => {
    if (isLoadingProducts) {
      return Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="flex flex-col"><CardHeader><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-3/4 mt-2" /></CardHeader><CardContent className="flex-grow space-y-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></CardContent><CardFooter><Skeleton className="h-11 w-full" /></CardFooter></Card>
      ));
    }

    if (products.length > 0) {
      return products.map((product) => renderPlanCard(product));
    }
    
    return renderFallbackContent();
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
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
