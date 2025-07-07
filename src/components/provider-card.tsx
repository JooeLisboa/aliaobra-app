import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/star-rating';
import { MapPin } from 'lucide-react';
import type { Provider } from '@/lib/types';

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link href={`/providers/${provider.id}`} className="block group">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-40 w-full">
            <Image
              src={`https://placehold.co/400x200.png`}
              alt={`${provider.name}'s work`}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
              data-ai-hint="construction work"
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
          <CardTitle className="text-lg font-semibold hover:text-primary">{provider.name}</CardTitle>
          <Badge variant="secondary" className="mt-1">{provider.category}</Badge>
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
