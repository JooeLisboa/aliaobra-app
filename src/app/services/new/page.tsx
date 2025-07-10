'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createService } from '@/lib/service-actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoaderCircle, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const serviceSchema = z.object({
  title: z.string().min(5, 'O título deve ter no mínimo 5 caracteres.').max(100, 'O título é muito longo.'),
  description: z.string().min(20, 'A descrição deve ter no mínimo 20 caracteres.').max(2000, 'A descrição é muito longa.'),
  category: z.string().min(3, 'A categoria é obrigatória.'),
  budget: z.coerce.number().positive('O orçamento deve ser um número positivo.'),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function NewServicePage() {
    const { user, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            title: '',
            description: '',
            category: '',
            budget: 0,
        },
    });

    if (isUserLoading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><LoaderCircle className="w-8 h-8 animate-spin" /></div>;
    }

    if (!user) {
        router.replace('/login?redirect=/services/new');
        return null;
    }

    async function onSubmit(values: ServiceFormValues) {
        if (!user) {
             toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Você precisa estar logado para publicar.' });
             return;
        }
        startTransition(async () => {
            const formData = new FormData();
            // NOTE: clientId is now handled securely on the server
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('category', values.category);
            formData.append('budget', values.budget.toString());

            const result = await createService(formData);

            if (result?.error) {
                 toast({
                    variant: 'destructive',
                    title: 'Erro ao publicar serviço',
                    description: result.error,
                });
            } else {
                 toast({
                    title: 'Serviço Publicado!',
                    description: 'Seu serviço já está visível para os profissionais.',
                });
                router.push('/services');
            }
        });
    }

    return (
        <div className="container mx-auto max-w-2xl py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Publique uma Nova Necessidade de Serviço</CardTitle>
                    <CardDescription>Descreva o que você precisa e receba propostas dos melhores profissionais.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título do Serviço</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Pintura de apartamento de 2 quartos" {...field} />
                                        </FormControl>
                                        <FormDescription>Seja breve e direto.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoria</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Pintura, Elétrica, Hidráulica" {...field} />
                                        </FormControl>
                                         <FormDescription>Ajuda os profissionais a encontrarem seu serviço.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição Detalhada</FormLabel>
                                        <FormControl>
                                            <Textarea rows={8} placeholder="Detalhe tudo o que precisa ser feito, inclua medidas, estado atual, e qualquer outra informação relevante." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="budget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Orçamento (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="500" {...field} />
                                        </FormControl>
                                        <FormDescription>Informe o valor que você pretende investir.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Alert>
                              <AlertTitle>Atenção</AlertTitle>
                              <AlertDescription>
                                Após a publicação, seu nome de usuário ficará visível para os profissionais que virem o serviço.
                              </AlertDescription>
                            </Alert>
                            <Button type="submit" disabled={isPending} className="w-full" size="lg">
                                {isPending && <LoaderCircle className="mr-2 animate-spin" />}
                                {isPending ? 'Publicando...' : 'Publicar Serviço'}
                                {!isPending && <Send className="ml-2" />}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
