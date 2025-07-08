'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getService } from '@/lib/data';
import type { Service } from '@/lib/types';
import { LoaderCircle, User, Calendar, Tag, DollarSign, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-user';
import { format } from 'date-fns';

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
    const [service, setService] = useState<Service | null | undefined>(undefined);
    const { user } = useUser();

    useEffect(() => {
        const fetchService = async () => {
            const serviceData = await getService(params.id);
            setService(serviceData);
        };
        fetchService();
    }, [params.id]);

    if (service === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <LoaderCircle className="w-8 h-8 animate-spin" />
            </div>
        );
    }
    
    if (service === null) {
        return notFound();
    }

    const isOwner = user && user.uid === service.clientId;
    const isProvider = user && user.profile?.userType !== 'client';

    return (
        <div className="container mx-auto max-w-4xl py-12">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="secondary" className="mb-2">{service.status.toUpperCase()}</Badge>
                            <CardTitle className="text-3xl">{service.title}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> Publicado por {service.clientName}</span>
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {format(new Date(service.createdAt), 'dd/MM/yyyy')}</span>
                            </CardDescription>
                        </div>
                         {isOwner && (
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4"/> Editar
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                           <Tag className="w-6 h-6 text-primary" />
                           <div>
                             <p className="text-sm text-muted-foreground">Categoria</p>
                             <p className="font-semibold">{service.category}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                           <DollarSign className="w-6 h-6 text-primary" />
                           <div>
                             <p className="text-sm text-muted-foreground">Orçamento</p>
                             <p className="font-semibold">R$ {service.budget.toLocaleString('pt-BR')}</p>
                           </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Descrição do Serviço</h3>
                        <p className="text-foreground/80 whitespace-pre-wrap">{service.description}</p>
                    </div>
                    
                    <div className="pt-6 border-t">
                        <h3 className="text-xl font-semibold mb-4">Propostas Recebidas</h3>
                        <div className="text-center py-8 bg-muted/50 rounded-lg">
                            <p className="text-muted-foreground">
                                {isProvider ? "Seja o primeiro a enviar uma proposta!" : "As propostas dos profissionais aparecerão aqui."}
                            </p>
                        </div>
                    </div>
                    
                    {isProvider && !isOwner && (
                        <div className="pt-6 border-t">
                           <Button size="lg" className="w-full">
                             Enviar Proposta
                           </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
