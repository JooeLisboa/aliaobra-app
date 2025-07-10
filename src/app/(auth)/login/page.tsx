"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { Wrench, LoaderCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const plan = searchParams.get('plan');

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Erro de Configuração",
        description: "A autenticação do Firebase não está configurada.",
      });
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Você será redirecionado em breve.",
      });

      // Redirect to the intended page, or dashboard as a fallback
      router.push(redirect || '/dashboard');

    } catch (error: any) {
      console.error(error);
      let errorMessage = "Ocorreu um erro inesperado.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Email ou senha inválidos.";
      }
      toast({
        variant: "destructive",
        title: "Erro ao Entrar",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const signupHref = () => {
    let base = '/signup';
    const params = new URLSearchParams();
    if (plan) params.set('plan', plan);
    if (redirect) params.set('redirect', redirect);
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-background p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <Wrench className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="text-2xl mt-4">Bem-vindo de volta!</CardTitle>
            <CardDescription>
                Entre na sua conta para gerenciar seus serviços.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
                     <div className="flex items-center">
                       <Label htmlFor="password">Senha</Label>
                       <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                         Esqueceu sua senha?
                       </Link>
                     </div>
                    <FormControl>
                      <Input id="password" type="password" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href={signupHref()} className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
