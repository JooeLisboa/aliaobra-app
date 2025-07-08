import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Básico',
    price: 'Grátis',
    description: 'Comece a divulgar seu trabalho e a receber avaliações.',
    features: [
      'Perfil público',
      'Até 5 fotos no portfólio',
      'Receber avaliações de clientes',
      'Visibilidade na busca padrão'
    ],
    cta: 'Comece Agora',
    href: '/signup?plan=basico'
  },
  {
    name: 'Profissional',
    price: 'R$ 29,90',
    priceFrequency: '/mês',
    description: 'Destaque-se da concorrência e consiga mais clientes.',
    features: [
      'Todos os benefícios do Básico',
      'Perfil em destaque nos resultados',
      'Selo de Profissional Verificado',
      'Portfólio com até 20 fotos',
      'Suporte prioritário'
    ],
    cta: 'Assinar Agora',
    href: '/signup?plan=profissional',
    isFeatured: true
  },
  {
    name: 'Agência',
    price: 'R$ 79,90',
    priceFrequency: '/mês',
    description: 'Gerencie múltiplos profissionais em uma única conta.',
    features: [
      'Todos os benefícios do Profissional',
      'Gerenciamento de até 10 perfis',
      'Portfólio consolidado da equipe',
      'Ferramentas de gestão',
      'Painel de controle da agência'
    ],
    cta: 'Contratar Plano',
    href: '/signup?plan=agencia'
  }
];

export default function PlansPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Escolha o Plano Certo para Você
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
          Planos flexíveis para impulsionar sua carreira ou sua agência na construção civil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.isFeatured ? 'border-primary shadow-lg' : ''}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.priceFrequency && <span className="text-muted-foreground">{plan.priceFrequency}</span>}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-sm text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="lg" variant={plan.isFeatured ? 'default' : 'outline'}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
