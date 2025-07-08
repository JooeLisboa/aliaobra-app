
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useUser } from '@/hooks/use-user';
import { getProvider } from '@/lib/data';
import { updateUserProfile } from '@/lib/profile-actions';
import type { Provider, PortfolioItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, Save, Trash2, PlusCircle, Image as ImageIcon, Info } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  avatarUrl: z.string().url('Por favor, insira uma URL válida para o avatar.'),
  category: z.string().min(3, 'A categoria deve ter pelo menos 3 caracteres.'),
  location: z.string().min(2, 'A localização deve ter pelo menos 2 caracteres.'),
  bio: z.string().min(10, 'A biografia deve ter pelo menos 10 caracteres.'),
  skills: z.string(),
  portfolio: z.array(z.object({
    id: z.string(),
    imageUrl: z.string().url(),
    description: z.string().min(3, 'A descrição é obrigatória.'),
    'data-ai-hint': z.string().min(2, 'A dica para IA é obrigatória.'),
  })),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUpdating, startUpdateTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      avatarUrl: '',
      category: '',
      location: '',
      bio: '',
      skills: '',
      portfolio: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "portfolio",
  });

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const fetchProviderData = async () => {
      setIsLoadingData(true);
      const providerData = await getProvider(user.uid);
      if (providerData) {
        setProvider(providerData);
        form.reset({
          name: providerData.name,
          avatarUrl: providerData.avatarUrl,
          category: providerData.category,
          location: providerData.location,
          bio: providerData.bio,
          skills: providerData.skills.join('\n'),
          portfolio: providerData.portfolio,
        });
      }
      setIsLoadingData(false);
    };

    fetchProviderData();
  }, [user, isUserLoading, router, form]);
  
  const onSubmit = (data: ProfileFormValues) => {
    if (!provider) return;

    startUpdateTransition(async () => {
      const result = await updateUserProfile({
        providerId: provider.id,
        ...data,
      });

      if (result.success) {
        toast({
          title: 'Perfil Atualizado!',
          description: 'Suas informações foram salvas com sucesso.',
        });
        router.push(`/providers/${provider.id}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao Atualizar',
          description: result.error,
        });
      }
    });
  };

  if (isLoadingData || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <LoaderCircle className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Página de Edição para Prestadores</AlertTitle>
          <AlertDescription>
            Esta página é exclusiva para profissionais e agências. Se você é um cliente, pode encontrar e contratar profissionais na <a href="/" className="underline font-semibold">página inicial</a>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Editar Perfil</CardTitle>
          <CardDescription>Atualize suas informações para atrair mais clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <section>
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Informações Básicas</h3>
                <div className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo / Nome da Agência</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="avatarUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Foto de Perfil</FormLabel>
                      <FormControl><Input {...field} placeholder="https://exemplo.com/sua-foto.png" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria Principal</FormLabel>
                      <FormControl><Input {...field} placeholder="Ex: Eletricista, Pintor" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <FormControl><Input {...field} placeholder="Ex: São Paulo, SP" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografia</FormLabel>
                      <FormControl><Textarea {...field} rows={4} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="skills" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habilidades e Especialidades</FormLabel>
                      <FormControl><Textarea {...field} rows={4} placeholder="Instalação de ar condicionado&#10;Reparos elétricos residenciais&#10;Manutenção preventiva" /></FormControl>
                      <FormDescription>Liste uma habilidade por linha.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Portfólio de Serviços</h3>
                <div className="space-y-6">
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Image src={item.imageUrl} alt={item.description} width={80} height={80} className="rounded-md object-cover aspect-square" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.description}</p>
                        <p className="text-sm text-muted-foreground">Dica de IA: "{item['data-ai-hint']}"</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="p-4 border border-dashed rounded-lg">
                      <h4 className="font-semibold mb-2">Adicionar Novo Item ao Portfólio</h4>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Input id="new-portfolio-desc" placeholder="Descrição do trabalho" className="flex-1" />
                        <Input id="new-portfolio-hint" placeholder="Dica para IA (ex: kitchen renovation)" className="flex-1" />
                        <Button type="button" onClick={() => {
                            const desc = (document.getElementById('new-portfolio-desc') as HTMLInputElement).value;
                            const hint = (document.getElementById('new-portfolio-hint') as HTMLInputElement).value;
                            if (desc && hint) {
                                append({
                                    id: `new_${Date.now()}`,
                                    description: desc,
                                    'data-ai-hint': hint,
                                    imageUrl: `https://placehold.co/400x300.png`
                                });
                                (document.getElementById('new-portfolio-desc') as HTMLInputElement).value = '';
                                (document.getElementById('new-portfolio-hint') as HTMLInputElement).value = '';
                            } else {
                                toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha a descrição e a dica para IA.'})
                            }
                        }}>
                          <PlusCircle /> Adicionar
                        </Button>
                      </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isUpdating}>
                  {isUpdating && <LoaderCircle className="animate-spin" />}
                  <Save />
                  {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}