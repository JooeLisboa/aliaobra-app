import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tag, User, Clock, ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`} className="block group">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <CardHeader>
            <CardTitle className="text-lg group-hover:text-primary">{service.title}</CardTitle>
            <CardDescription className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {service.clientName}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(service.createdAt), { locale: ptBR, addSuffix: true })}</span>
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {service.description}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Tag className="w-4 h-4 text-primary" />
            <Badge variant="outline">{service.category}</Badge>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
          <div>
             <p className="text-xs text-muted-foreground">Orçamento</p>
             <p className="font-bold text-lg text-primary">R$ {service.budget.toLocaleString('pt-BR')}</p>
          </div>
          <div className="flex items-center text-sm font-semibold text-primary group-hover:underline">
              Ver Detalhes <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
