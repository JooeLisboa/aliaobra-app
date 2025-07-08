
"use client";

import { useState, useEffect, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { LoaderCircle, Save, Trash2, PlusCircle, Info, Upload } from 'lucide-react';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const profileSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  category: z.string().min(3, 'A categoria deve ter pelo menos 3 caracteres.'),
  location: z.string().min(2, 'A localização deve ter pelo menos 2 caracteres.'),
  bio: z.string().min(10, 'A biografia deve ter pelo menos 10 caracteres.').max(500, 'A biografia não pode ter mais de 500 caracteres.'),
  skills: z.string().optional(),
  portfolio: z.array(z.object({
    id: z.string(),
    imageUrl: z.string().url(),
    description: z.string(),
    'data-ai-hint': z.string(),
  })),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type NewPortfolioItem = {
    id: string;
    file: File;
    previewUrl: string;
    description: string;
    'data-ai-hint': string;
};

export default function EditProfilePage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUpdating, startUpdateTransition] = useTransition();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newPortfolioItems, setNewPortfolioItems] = useState<NewPortfolioItem[]>([]);
  
  const [newPortfolioDesc, setNewPortfolioDesc] = useState('');
  const [newPortfolioHint, setNewPortfolioHint] = useState('');
  const [newPortfolioFile, setNewPortfolioFile] = useState<File | null>(null);

  const newPortfolioFileRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', category: '', location: '', bio: '', skills: '', portfolio: [] },
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "portfolio",
  });
  
  useEffect(() => {
    if (isUserLoading) return;
    if (!user) { router.replace('/login'); return; }

    const fetchProviderData = async () => {
      setIsLoadingData(true);
      const providerData = await getProvider(user.uid);
      if (providerData) {
        setProvider(providerData);
        form.reset({
          name: providerData.name,
          category: providerData.category,
          location: providerData.location,
          bio: providerData.bio,
          skills: providerData.skills.join('\n'),
          portfolio: providerData.portfolio,
        });
        setAvatarPreview(providerData.avatarUrl);
      }
      setIsLoadingData(false);
    };
    fetchProviderData();
  }, [user, isUserLoading, router, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: 'destructive', title: 'Arquivo muito grande', description: `A imagem do perfil deve ter no máximo ${MAX_FILE_SIZE_MB}MB.` });
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({ variant: 'destructive', title: 'Tipo de arquivo inválido', description: 'Por favor, selecione uma imagem (JPG, PNG, WebP).' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAddPortfolioItem = () => {
    const file = newPortfolioFile;
    const description = newPortfolioDesc;
    const hint = newPortfolioHint;

    if (!file || file.size === 0 || !description || !hint) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha a descrição, a dica para IA e selecione uma imagem.' });
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: 'destructive', title: 'Arquivo muito grande', description: `A imagem do portfólio deve ter no máximo ${MAX_FILE_SIZE_MB}MB.` });
        return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({ variant: 'destructive', title: 'Tipo de arquivo inválido', description: 'Por favor, selecione uma imagem (JPG, PNG, WebP).' });
        return;
    }

    const newItem: NewPortfolioItem = {
      id: `new_${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      description,
      'data-ai-hint': hint,
    };
    setNewPortfolioItems(prev => [...prev, newItem]);
    
    setNewPortfolioDesc('');
    setNewPortfolioHint('');
    setNewPortfolioFile(null);
    if (newPortfolioFileRef.current) {
        newPortfolioFileRef.current.value = '';
    }
  };

  const removeNewPortfolioItem = (id: string) => {
    setNewPortfolioItems(prev => prev.filter(item => item.id !== id));
  };
  
  const onSubmit = (data: ProfileFormValues) => {
    if (!provider || !user) return;
    
    const totalPortfolio = fields.length + newPortfolioItems.length;
    if (totalPortfolio < 2) {
      toast({ variant: 'destructive', title: 'Portfólio incompleto', description: 'Você precisa ter no mínimo 2 itens no seu portfólio.' });
      return;
    }

    startUpdateTransition(async () => {
      const formData = new FormData();
      
      // Securely add the user ID
      formData.append('userId', user.uid);
      
      formData.append('name', data.name);
      formData.append('category', data.category);
      formData.append('location', data.location);
      formData.append('bio', data.bio);
      formData.append('skills', data.skills ?? '');
      formData.append('existingPortfolio', JSON.stringify(data.portfolio));

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      newPortfolioItems.forEach((item, index) => {
        formData.append(`new_portfolio_image_${index}`, item.file);
        formData.append(`new_portfolio_desc_${index}`, item.description);
        formData.append(`new_portfolio_hint_${index}`, item['data-ai-hint']);
      });

      const result = await updateUserProfile(formData);

      if (result.success) {
        toast({ title: 'Perfil Atualizado!', description: 'Suas informações foram salvas com sucesso.' });
        router.push(`/providers/${provider.id}`);
      } else {
        toast({ variant: 'destructive', title: 'Erro ao Atualizar', description: result.error });
      }
    });
  };

  if (isLoadingData || isUserLoading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><LoaderCircle className="w-8 h-8 animate-spin" /></div>;
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Página de Edição de Perfil</AlertTitle>
          <AlertDescription>
            A funcionalidade de edição de perfil para clientes está em desenvolvimento. Por enquanto, esta página é exclusiva para profissionais e agências.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Editar Perfil</CardTitle>
              <CardDescription>Atualize suas informações para que os clientes possam te encontrar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <section>
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Informações Básicas</h3>
                <div className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nome Completo / Nome da Agência</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  
                  <FormItem>
                    <FormLabel>Foto de Perfil</FormLabel>
                    <div className="flex items-center gap-4">
                      {avatarPreview && <Image src={avatarPreview} alt="Avatar preview" width={80} height={80} className="rounded-full object-cover aspect-square" />}
                      <div className='flex flex-col gap-2'>
                        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                          <Upload className="mr-2 h-4 w-4" /> Alterar Foto
                        </Button>
                        <Input id="avatar-upload" type="file" className="hidden" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleAvatarChange} />
                         <p className="text-xs text-muted-foreground">Tamanho máx: {MAX_FILE_SIZE_MB}MB. JPG, PNG, WebP.</p>
                      </div>
                    </div>
                  </FormItem>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Categoria Principal</FormLabel><FormControl><Input {...field} placeholder="Ex: Eletricista, Pintor" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem><FormLabel>Localização</FormLabel><FormControl><Input {...field} placeholder="Ex: São Paulo, SP" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem><FormLabel>Biografia</FormLabel><FormControl><Textarea {...field} rows={5} placeholder="Fale sobre você, sua experiência e o que você oferece." /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="skills" render={({ field }) => (
                    <FormItem><FormLabel>Habilidades e Especialidades</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Instalação de ar condicionado&#10;Reparos elétricos residenciais&#10;Manutenção preventiva" /></FormControl><FormDescription>Liste uma habilidade por linha.</FormDescription><FormMessage /></FormItem>
                  )} />
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Portfólio de Serviços</h3>
                 <p className="text-sm text-muted-foreground mb-4">Mostre seus melhores trabalhos. O portfólio deve ter no mínimo 2 itens.</p>
                <div className="space-y-6">
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/30 relative">
                      <Image src={item.imageUrl} alt={item.description} width={80} height={80} className="rounded-md object-cover aspect-square" />
                      <div className="flex-1"><p className="font-semibold">{item.description}</p><p className="text-sm text-muted-foreground">Dica de IA: "{item['data-ai-hint']}"</p></div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute top-2 right-2"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                  {newPortfolioItems.map((item) => (
                     <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/30 relative">
                       <Image src={item.previewUrl} alt={item.description} width={80} height={80} className="rounded-md object-cover aspect-square" />
                       <div className="flex-1"><p className="font-semibold">{item.description}</p><p className="text-sm text-muted-foreground">Dica de IA: "{item['data-ai-hint']}"</p></div>
                       <Button type="button" variant="ghost" size="icon" onClick={() => removeNewPortfolioItem(item.id)} className="absolute top-2 right-2"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                     </div>
                  ))}
                  
                  <Card className="p-4 border-dashed">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Adicionar Novo Item ao Portfólio</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="new-portfolio-desc">Descrição do trabalho</Label>
                              <Input 
                                id="new-portfolio-desc"
                                placeholder="Ex: Reforma de cozinha"
                                required
                                value={newPortfolioDesc}
                                onChange={(e) => setNewPortfolioDesc(e.target.value)}
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="new-portfolio-hint">Dica para IA (em inglês)</Label>
                              <Input
                                id="new-portfolio-hint"
                                placeholder="Ex: kitchen renovation"
                                required
                                value={newPortfolioHint}
                                onChange={(e) => setNewPortfolioHint(e.target.value)}
                              />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-portfolio-file">Imagem do trabalho</Label>
                          <Input
                            id="new-portfolio-file"
                            ref={newPortfolioFileRef}
                            type="file"
                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                            required
                            onChange={(e) => setNewPortfolioFile(e.target.files?.[0] || null)}
                          />
                          <FormDescription>Tamanho máximo: {MAX_FILE_SIZE_MB}MB.</FormDescription>
                        </div>
                        <Button type="button" onClick={handleAddPortfolioItem}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar ao Portfólio</Button>
                      </div>
                  </Card>
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={isUpdating}>
                  {isUpdating ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2" />}
                  {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
