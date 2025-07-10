
'use client';

import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoaderCircle, Briefcase, User, HardHat, FileText, Send, Pencil, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getServices } from '@/lib/data';
import type { Service, Provider } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function ClientDashboard({ user, services }: { user: any, services: Service[] }) {
    const myServices = services.filter(s => s.clientId === user.uid);
    const openServices = myServices.filter(s => s.status === 'open').length;
    const inProgressServices = myServices.filter(s => s.status === 'in_progress').length;

    return (
        <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Serviços Abertos</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openServices}</div>
                        <p className="text-xs text-muted-foreground">Aguardando propostas de profissionais.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Serviços em Andamento</CardTitle>
                        <HardHat className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressServices}</div>
                         <p className="text-xs text-muted-foreground">Propostas aceitas e em execução.</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" className="flex-1">
                        <Link href="/services/new"><Send className="mr-2" /> Publicar um Novo Serviço</Link>
                    </Button>
                     <Button asChild size="lg" variant="outline" className="flex-1">
                        <Link href="/chat"><MessageSquare className="mr-2" /> Ver Minhas Mensagens</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function ProviderDashboard({ user }: { user: any }) {
    const provider = user.profile as Provider;
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Status do Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${provider.status === 'Disponível' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                            <span className="font-semibold text-lg">Você está {provider.status}</span>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/profile/edit">
                                <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Oportunidades</CardTitle>
                    <CardDescription>Encontre novos projetos para aplicar suas habilidades.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild size="lg" className="w-full">
                        <Link href="/services"><Briefcase className="mr-2" /> Ver Mural de Serviços</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}


export default function DashboardPage() {
    const { user, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login');
        }
    }, [user, isUserLoading, router]);
    
    useEffect(() => {
        if (user) {
            const fetchServices = async () => {
                setIsLoadingData(true);
                const allServices = await getServices();
                setServices(allServices);
                setIsLoadingData(false);
            };
            fetchServices();
        }
    }, [user]);

    if (isUserLoading || isLoadingData) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><LoaderCircle className="w-8 h-8 animate-spin" /></div>;
    }

    if (!user) {
        return null; // or a redirect message
    }

    const isProviderOrAgency = user.profile?.userType === 'provider' || user.profile?.userType === 'agency';
    const displayName = user.profile?.name ?? user.displayName ?? 'Usuário';

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-4 mb-8">
                <h1 className="text-3xl font-bold">Bem-vindo(a) de volta, {displayName}!</h1>
                <p className="text-muted-foreground">Aqui está um resumo da sua atividade na plataforma AliaObra.</p>
            </div>
            
            {user.profile ? (
                 isProviderOrAgency ? <ProviderDashboard user={user} /> : <ClientDashboard user={user} services={services} />
            ) : (
                <Alert>
                    <User className="h-4 w-4" />
                    <AlertTitle>Complete seu cadastro</AlertTitle>
                    <AlertDescription>
                        Parece que seu perfil não foi totalmente configurado. Por favor, entre em contato com o suporte ou tente recriar sua conta para acessar todas as funcionalidades.
                    </AlertDescription>
                </Alert>
            )}

        </div>
    );
}
