"use client";

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/star-rating';
import type { Review } from '@/lib/types';
import { Separator } from './ui/separator';
import { getReviewSummary } from '@/app/actions';
import { Sparkles, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSummarize = async () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('reviewText', review.comment);
      const result = await getReviewSummary(formData);
      if (result.error) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Erro na Análise",
          description: result.error,
        })
      } else {
        setSummary(result.summary ?? null);
      }
    });
  };

  return (
    <>
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage src={review.author.avatarUrl} alt={review.author.name} />
          <AvatarFallback>{review.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{review.author.name}</p>
              <p className="text-xs text-muted-foreground">{review.date}</p>
            </div>
            <StarRating rating={review.rating} readOnly size={16} />
          </div>
          <p className="text-sm text-foreground/90">{review.comment}</p>
          {review.imageUrl && (
            <div className="pt-2">
              <Image
                src={review.imageUrl}
                alt="Foto da avaliação"
                width={200}
                height={150}
                className="rounded-lg object-cover"
                data-ai-hint="project detail"
              />
            </div>
          )}
          <div className="pt-2">
            {!summary && !isPending && (
              <Button variant="outline" size="sm" onClick={handleSummarize}>
                <Sparkles className="w-4 h-4 mr-2" />
                Analisar com IA
              </Button>
            )}
            {isPending && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                </div>
            )}
            {summary && (
              <Card className="bg-secondary/50 mt-2">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Resumo da IA</p>
                  <p className="text-sm text-foreground/80">{summary}</p>
                </CardContent>
              </Card>
            )}
            {error && !isPending && <p className="text-xs text-destructive mt-2">{error}</p>}
          </div>
        </div>
      </div>
      <Separator className="my-6 last:hidden" />
    </>
  );
}
