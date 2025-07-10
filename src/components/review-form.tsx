
"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/star-rating';
import { useToast } from '@/hooks/use-toast';
import { Send, Video, FileUp, LoaderCircle, Camera } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser } from '@/hooks/use-user';
import { addReview } from '@/lib/review-actions';

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
    message: "Uma foto é obrigatória para avaliações de 3 estrelas ou menos.",
    path: ["image"],
});

export function ReviewForm({ providerId }: { providerId: string }) {
  const [open, setOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const rating = form.watch("rating");

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
        }
      };
      getCameraPermission();
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraOpen]);


  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        form.setValue('image', dataUrl, { shouldValidate: true });
        setIsCameraOpen(false);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCapturedImage(dataUrl);
        form.setValue('image', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerClick = () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
    } else {
      setOpen(true);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: "destructive", title: "Não autenticado", description: "Você precisa fazer login para deixar uma avaliação." });
      return;
    }
    startTransition(async () => {
      const result = await addReview({
        providerId: providerId,
        rating: values.rating,
        comment: values.comment,
        imageUrl: capturedImage,
        authorId: user.uid,
      });
      if (result.success) {
        toast({ title: "Avaliação Enviada!", description: "Obrigado por seu feedback. A página será atualizada." });
        setOpen(false);
        form.reset();
        setCapturedImage(null);
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Erro ao Enviar", description: result.error });
      }
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!user) return; 
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
          setCapturedImage(null);
        }
      }}>
        <DialogTrigger asChild>
           <Button onClick={handleTriggerClick}>Deixar uma avaliação</Button>
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
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Anexar Foto</FormLabel>
                    <div className="flex gap-2 items-center">
                        <Button type="button" variant="outline" onClick={() => document.getElementById('file-input')?.click()} disabled={isPending}>
                            <FileUp className="mr-2 h-4 w-4" />
                            Do Arquivo
                        </Button>
                        <Input id="file-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isPending} />

                        <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" disabled={isPending}><Video className="mr-2 h-4 w-4" /> Da Câmera</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                <DialogTitle>Capturar Foto</DialogTitle>
                                <DialogDescription>
                                    Aponte a câmera para o que deseja fotografar e clique em "Capturar".
                                </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center gap-4">
                                  <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                                  {hasCameraPermission === false && (
                                    <Alert variant="destructive">
                                      <AlertTitle>Acesso à Câmera Negado</AlertTitle>
                                      <AlertDescription>
                                          Por favor, habilite a permissão da câmera no seu navegador.
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                  <canvas ref={canvasRef} className="hidden" />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancelar</Button>
                                    </DialogClose>
                                    <Button type="button" onClick={handleCapturePhoto} disabled={!hasCameraPermission}><Camera className="mr-2 h-4 w-4" />Capturar Foto</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {capturedImage && (
                        <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Pré-visualização:</p>
                            <Image src={capturedImage} alt="Preview da imagem capturada" width={200} height={150} className="rounded-lg object-cover" />
                        </div>
                    )}
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
                <Button type="submit" disabled={isPending}>
                  {isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className='mr-2 h-4 w-4' /> 
                  {isPending ? 'Enviando...' : 'Enviar Avaliação'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
