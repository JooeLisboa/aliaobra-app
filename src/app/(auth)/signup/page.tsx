
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/lib/auth-actions';
import { Wrench, LoaderCircle } from "lucide-react";

const signupSchema = z.object({
  fullName: z.string().min(3, { message: 'Nome completo deve ter no mínimo 3 caracteres.' }),
  cpfCnpj: z.string().min(11, { message: 'CPF/CNPJ deve ter no mínimo 11 caracteres.' }).max(18, { message: 'CPF/CNPJ inválido.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
  userType: z.enum(['client', 'provider', 'agency'], { required_error: 'Por favor, selecione um objetivo.'}),
});


export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const redirect = searchParams.get('redirect');

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      cpfCnpj: "",
      email: "",
      password: "",
      userType: "client",
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsLoading(true);

    if (!auth) {
      toast({
        variant: "destructive",
        title: "Erro de Configuração",
        description: "A autenticação do Firebase não está configurada. Por favor, preencha as credenciais no servidor.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // 2. Create user profile in Firestore via Server Action
      const profileResult = await createUserProfile({
        uid: user.uid,
        email: user.email!,
        fullName: values.fullName,
        cpfCnpj: values.cpfCnpj,
        userType: values.userType,
        plan: plan || undefined,
      });

      if (!profileResult.success) {
        // Ideally, delete the user from Auth to prevent orphaned accounts
        throw new Error(profileResult.error || 'Falha ao criar o perfil do usuário.');
      }

      toast({
        title: "Conta Criada com Sucesso!",
        description: "Você será redirecionado.",
      });

      router.push(redirect || '/dashboard');

    } catch (error: any) {
      console.error(error);
      let errorMessage = "Ocorreu um erro inesperado.";
       if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este email já está em uso. Tente fazer login ou use um email diferente.";
      } else if (error.code === 'auth/api-key-not-valid') {
        errorMessage = "A chave de API do Firebase é inválida. Verifique suas credenciais e as configurações do seu projeto no console do Firebase.";
      } else if (error.message.includes('Não foi possível criar o perfil')) {
        errorMessage = "Sua conta foi criada, mas falhamos ao salvar seu perfil. Verifique as regras de segurança do Firestore ou contate o suporte.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Erro ao Criar Conta",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-background p-4">
      <Card className="mx-auto max-w-lg w-full">
        <CardHeader className="text-center">
          <Wrench className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl mt-4">Crie sua Conta</CardTitle>
          <CardDescription>
            Junte-se à nossa comunidade para contratar ou oferecer serviços.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <Label htmlFor="full-name">Nome Completo ou Nome da Agência</Label>
                      <FormControl>
                        <Input id="full-name" placeholder="Seu nome" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpfCnpj"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <Label htmlFor="cpf">CPF ou CNPJ</Label>
                      <FormControl>
                        <Input id="cpf" placeholder="000.000.000-00" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <FormControl>
                        <Input id="email" type="email" placeholder="seu@email.com" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <Label htmlFor="password">Senha</Label>
                      <FormControl>
                        <Input id="password" type="password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <Label>Qual é o seu objetivo?</Label>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                          disabled={isLoading}
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="client" id="client" className="peer sr-only" />
                            </FormControl>
                            <Label htmlFor="client" className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                              Quero Contratar
                            </Label>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="provider" id="provider" className="peer sr-only" />
                            </FormControl>
                            <Label htmlFor="provider" className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                              Sou Profissional
                            </Label>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="agency" id="agency" className="peer sr-only" />
                            </FormControl>
                            <Label htmlFor="agency" className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                              Sou uma Agência
                            </Label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-center text-xs text-muted-foreground px-2 py-2">
                    <p>
                        Ao criar sua conta, você concorda que a AliaObra é uma plataforma de conexão e não se responsabiliza pelos serviços, pagamentos ou acordos entre usuários.
                    </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
