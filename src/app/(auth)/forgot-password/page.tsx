"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { MailQuestion, LoaderCircle, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Erro de Configuração",
        description: "O serviço de autenticação não está disponível.",
      });
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, values.email);
      toast({
        title: "Email de Recuperação Enviado",
        description: "Verifique sua caixa de entrada para o link de redefinição de senha.",
      });
      router.push('/login');
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      let errorMessage = "Ocorreu um erro inesperado.";
      // Firebase often returns 'auth/user-not-found' but for security, 
      // it's better not to confirm if an email exists.
      if (error.code === 'auth/invalid-email') {
        errorMessage = "O email fornecido é inválido.";
      } else {
        errorMessage = "Não foi possível enviar o email de recuperação. Tente novamente mais tarde."
      }
      toast({
        variant: "destructive",
        title: "Erro ao Enviar Email",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-background p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <MailQuestion className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="text-2xl mt-4">Esqueceu sua senha?</CardTitle>
            <CardDescription>
                Sem problemas. Digite seu email e enviaremos um link para você criar uma nova.
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3"/> Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
