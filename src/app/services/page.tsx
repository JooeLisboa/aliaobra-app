
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getServices } from '@/lib/data';
import type { Service } from '@/lib/types';
import { LoaderCircle, PlusCircle, Search } from 'lucide-react';
import { ServiceCard } from '@/components/service-card';
import { useUser } from '@/hooks/use-user';

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoading(true);
            const servicesFromDb = await getServices();
            setServices(servicesFromDb);
            setIsLoading(false);
        };
        fetchServices();
    }, []);

    const isClient = user?.profile?.userType === 'client';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Encontre Serviços</h1>
                    <p className="text-muted-foreground">Veja as oportunidades publicadas por clientes.</p>
                </div>
                 {user && (isClient || !user.profile) && ( // Allow users with no profile to post a job
                    <Button asChild>
                        <Link href="/services/new">
                            <PlusCircle className="mr-2" />
                            Publicar um Serviço
                        </Link>
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <LoaderCircle className="w-8 h-8 animate-spin mr-4" />
                    Carregando serviços...
                </div>
            ) : services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg">
                    <Search className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum serviço encontrado</h3>
                    <p className="mt-2 text-sm">
                        Ainda não há serviços publicados. {isClient ? "Que tal publicar o primeiro?" : "Volte mais tarde para ver novas oportunidades."}
                    </p>
                </div>
            )}
        </div>
    );
}
