
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/star-rating';
import { MapPin, Briefcase, ShieldCheck } from 'lucide-react';
import type { Provider } from '@/lib/types';
import { PlanIcon } from './plan-icon';

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const portfolioImage = provider.portfolio?.[0]?.imageUrl || 'https://placehold.co/400x200.png';
  const portfolioHint = provider.portfolio?.[0]?.['data-ai-hint'] || 'construction work';

  return (
    <Link href={`/providers/${provider.id}`} className="block group">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-40 w-full">
            <Image
              src={portfolioImage}
              alt={`${provider.name}'s work`}
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint={portfolioHint}
            />
            <div className="absolute -bottom-8 left-4">
              <Avatar className="h-16 w-16 border-4 border-card">
                <AvatarImage src={provider.avatarUrl} alt={provider.name} />
                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-10 flex-grow">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold hover:text-primary">{provider.name}</CardTitle>
            <PlanIcon plan={provider.plan} />
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary">{provider.category}</Badge>
            {provider.type === 'agency' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                Agência
              </Badge>
            )}
            {provider.isVerified && (
                <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
                    <ShieldCheck className="w-3 h-3" />
                    Verificado
                </Badge>
            )}
           </div>
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <MapPin className="w-4 h-4 mr-1.5" />
            <span>{provider.location}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-sm">
          <StarRating rating={provider.rating} readOnly />
          <span className="text-muted-foreground">({provider.reviewCount} avaliações)</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
