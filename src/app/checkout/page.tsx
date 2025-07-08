'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, Check, CreditCard, ArrowLeft, Info } from 'lucide-react';
import { updateUserPlan } from '@/lib/plan-actions';

const plansData = [
    {
        name: 'Básico',
        id: 'basico',
        price: 'Grátis',
        description: 'Funcionalidades essenciais para começar.',
        features: [
            'Perfil público',
            'Até 5 fotos no portfólio',
            'Receber avaliações de clientes',
            'Visibilidade na busca padrão'
        ],
    },
    {
        name: 'Profissional',
        id: 'profissional',
        price: 'R$ 29,90',
        priceFrequency: '/mês',
        description: 'Destaque-se da concorrência.',
        features: [
            'Todos os benefícios do Básico',
            'Perfil em destaque nos resultados',
            'Selo de Profissional Verificado',
            'Portfólio com até 20 fotos',
            'Suporte prioritário'
        ],
    },
    {
        name: 'Agência',
        id: 'agencia',
        price: 'R$ 79,90',
        priceFrequency: '/mês',
        description: 'Para equipes e agências.',
        features: [
            'Todos os benefícios do Profissional',
            'Gerenciamento de até 10 perfis',
            'Painel de controle da agência'
        ],
    }
];

function CheckoutContent() {
    const { user, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const planId = searchParams.get('plan') as 'basico' | 'profissional' | 'agencia' | null;
    const selectedPlan = plansData.find(p => p.id === planId);

    if (isUserLoading) {
        return (
            <div className="w-full flex-1 flex items-center justify-center">
                <LoaderCircle className="w-8 h-8 animate-spin" />
            </div>
        );
    }
    
    if (!user) {
         router.replace('/login?redirect=/plans');
         return (
            <div className="w-full flex-1 flex items-center justify-center">
                <LoaderCircle className="w-8 h-8 animate-spin" />
                <p className="ml-2">Redirecionando para o login...</p>
            </div>
        );
    }

    if (!selectedPlan) {
        return (
            <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Plano Inválido</AlertTitle>
                <AlertDescription>
                    O plano selecionado não foi encontrado. Por favor, volte e selecione um plano válido.
                    <Button asChild variant="link" className="p-0 h-auto ml-1">
                      <Link href="/plans">Voltar para Planos</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }
    
    const handleConfirmSubscription = async () => {
        if (!user || !selectedPlan || selectedPlan.id === 'basico') return;

        startTransition(async () => {
            const result = await updateUserPlan({
                userId: user.uid,
                planId: selectedPlan.id,
            });

            if (result.success) {
                toast({
                    title: 'Plano atualizado com sucesso!',
                    description: `Agora você está no plano ${selectedPlan.name}.`,
                });
                router.push('/profile/edit');
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Erro ao atualizar o plano',
                    description: result.error,
                });
            }
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Confirmar Assinatura</CardTitle>
                <CardDescription>
                    Você está prestes a assinar o plano <span className="font-bold text-primary">{selectedPlan.name}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{selectedPlan.name}</span>
                        <div className="text-right">
                           <span className="text-2xl font-bold">{selectedPlan.price}</span>
                           {selectedPlan.priceFrequency && <span className="text-muted-foreground">{selectedPlan.priceFrequency}</span>}
                        </div>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                       {selectedPlan.features.map(feature => (
                           <li key={feature} className="flex items-center gap-2">
                               <Check className="w-4 h-4 text-green-500" />
                               <span>{feature}</span>
                           </li>
                       ))}
                    </ul>
                    <Alert>
                      <CreditCard className="h-4 w-4" />
                      <AlertTitle>Simulação de Pagamento</AlertTitle>
                      <AlertDescription>
                        Este é um ambiente de teste. Nenhum pagamento real será processado. Ao clicar em confirmar, seu plano será atualizado instantaneamente.
                      </AlertDescription>
                    </Alert>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                    <Link href="/plans">
                        <ArrowLeft className="mr-2" />
                        Voltar
                    </Link>
                </Button>
                <Button onClick={handleConfirmSubscription} disabled={isPending}>
                    {isPending ? <LoaderCircle className="animate-spin" /> : <CreditCard />}
                    {isPending ? 'Processando...' : 'Confirmar Assinatura'}
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function CheckoutPage() {
    return (
        <div className="container mx-auto max-w-2xl py-12">
          <Suspense fallback={<div className="w-full flex-1 flex items-center justify-center"><LoaderCircle className="w-8 h-8 animate-spin" /></div>}>
             <CheckoutContent />
          </Suspense>
        </div>
    );
}