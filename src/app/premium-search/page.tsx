// src/app/premium-search/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/hooks/use-user';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wand2, LoaderCircle, ArrowRight } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { addDoc, collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

// TODO: Replace with your actual Stripe Price ID for the one-time consultation
const PREMIUM_SEARCH_PRICE_ID = 'price_...'; // COLE SEU ID DO PREÇO DO STRIPE AQUI

const searchSchema = z.object({
  projectDescription: z.string().min(50, 'Descreva seu projeto com pelo menos 50 caracteres para uma análise precisa.'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

function PremiumSearchContent() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      projectDescription: '',
    },
  });
  
  const { isSubmitting } = useFormState({ control: form.control });
  
  // Handle redirect from Stripe checkout
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const description = searchParams.get('description');

    if (sessionId && description) {
        // Here you could verify the session on your backend if needed.
        // For simplicity, we'll directly redirect to the results page.
        router.replace(`/premium-search-result?description=${description}`);
    }
  }, [searchParams, router]);


  const handleCheckout = async (values: SearchFormValues) => {
    if (!user) {
      router.push('/login?redirect=/premium-search');
      return;
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      toast({ variant: 'destructive', title: 'Erro de Configuração', description: 'A chave publicável do Stripe não está configurada.' });
      return;
    }
     if (PREMIUM_SEARCH_PRICE_ID === 'price_...') {
      toast({ variant: 'destructive', title: 'Erro de Configuração', description: 'O ID do preço da consulta premium não foi definido no código. Crie o produto no Stripe e adicione o ID do preço.' });
      return;
    }

    setIsRedirecting(true);

    try {
      const checkoutSessionRef = collection(db, 'customers', user.uid, 'checkout_sessions');
      const docRef = await addDoc(checkoutSessionRef, {
        price: PREMIUM_SEARCH_PRICE_ID,
        mode: 'payment', // Specify 'payment' for one-time purchases
        success_url: `${window.location.origin}/premium-search?session_id={CHECKOUT_SESSION_ID}&description=${encodeURIComponent(values.projectDescription)}`,
        cancel_url: `${window.location.origin}/premium-search`,
        allow_promotion_codes: true,
      });

      onSnapshot(docRef, async (snap) => {
        const { error, sessionId } = snap.data() || {};
        if (error) {
          const errorMessage = error.message || 'Ocorreu um erro desconhecido durante o pagamento.';
          toast({ variant: 'destructive', title: 'Erro no Pagamento', description: errorMessage });
          console.error("Stripe checkout error:", errorMessage, error);
          setIsRedirecting(false);
          return;
        }
        if (sessionId) {
          const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
          if (stripe) {
            await stripe.redirectToCheckout({ sessionId });
          } else {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o Stripe.' });
            setIsRedirecting(false);
          }
        }
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível iniciar o checkout. Tente novamente.' });
      console.error(error);
      setIsRedirecting(false);
    }
  };

  if (isUserLoading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><LoaderCircle className="w-8 h-8 animate-spin" /></div>;
  }
  
  if (searchParams.get('session_id')) {
     return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><LoaderCircle className="w-8 h-8 animate-spin" /></div>;
  }


  if (!user) {
    return (
        <div className="container mx-auto max-w-2xl py-12">
            <Card>
                <CardHeader className="items-center text-center">
                    <Wand2 className="w-12 h-12 text-primary" />
                    <CardTitle className="text-2xl mt-2">Busca Inteligente de Profissionais</CardTitle>
                    <CardDescription>Faça login para usar nossa IA e encontrar o profissional perfeito para seu projeto.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full" size="lg">
                        <Link href="/login?redirect=/premium-search">
                            Fazer Login para Continuar <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCheckout)}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Wand2 className="w-8 h-8 text-primary" />
                Busca Inteligente por IA
              </CardTitle>
              <CardDescription>
                Descreva seu projeto em detalhes e nossa IA encontrará o profissional mais qualificado e disponível em nossa base de dados para você.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Descrição do seu Projeto</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={10}
                        placeholder="Ex: Preciso reformar um banheiro de 2x3m. Gostaria de trocar o piso por porcelanato, instalar um novo vaso sanitário, um box de vidro e pintar as paredes com tinta resistente à umidade. O apartamento fica em São Paulo, SP."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
               <Alert>
                  <AlertTitle>Consulta Premium</AlertTitle>
                  <AlertDescription>
                    Este é um serviço premium. Haverá uma cobrança única de R$8,90 para realizar a análise e encontrar o melhor profissional para o seu projeto.
                  </AlertDescription>
                </Alert>
              <Button type="submit" size="lg" disabled={isRedirecting || isSubmitting}>
                {(isRedirecting || isSubmitting) && <LoaderCircle className="animate-spin mr-2" />}
                Encontrar Profissional com IA (R$ 8,90)
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}


export default function PremiumSearchPage() {
    return (
        <Suspense>
            <PremiumSearchContent />
        </Suspense>
    )
}
