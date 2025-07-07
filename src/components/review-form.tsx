"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/star-rating';
import { useToast } from '@/hooks/use-toast';
import { Camera, Send } from 'lucide-react';

const formSchema = z.object({
  rating: z.number().min(1, "A avaliação é obrigatória.").max(5),
  comment: z.string().min(10, "Por favor, escreva um comentário com pelo menos 10 caracteres."),
  image: z.any().optional(),
}).refine(data => {
    if (data.rating <= 3) {
        return !!data.image;
    }
    return true;
}, {
    message: "Uma foto e justificativa são obrigatórias para avaliações de 3 estrelas ou menos.",
    path: ["image"],
});

export function ReviewForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const rating = form.watch("rating");

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Avaliação Enviada!",
      description: "Obrigado por seu feedback.",
    });
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Deixar uma avaliação</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Avalie o serviço</DialogTitle>
          <DialogDescription>
            Seu feedback é muito importante para a comunidade.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="mb-2">Sua nota</FormLabel>
                  <FormControl>
                    <StarRating
                      rating={field.value}
                      onValueChange={field.onChange}
                      size={32}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva sua experiência com o profissional..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Camera className='w-4 h-4' /> Anexar Foto</FormLabel>
                  <FormControl>
                    <Input type="file" {...form.register("image")} />
                  </FormControl>
                  {rating > 0 && rating <= 3 && (
                    <FormDescription className="text-destructive">
                      Uma foto é obrigatória para esta avaliação.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit"><Send className='mr-2' /> Enviar Avaliação</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
