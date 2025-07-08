
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Termos de Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground prose prose-lg dark:prose-invert">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <h2 className="text-xl font-semibold text-foreground">1. Introdução</h2>
          <p>
            Bem-vindo ao AliaObra. Ao utilizar nossos serviços, você concorda em cumprir e estar sujeito aos seguintes termos e condições de uso. Por favor, revise-os cuidadosamente.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. Papel da Plataforma</h2>
          <p>
            O AliaObra atua exclusivamente como uma plataforma para facilitar o contato entre clientes que necessitam de serviços ("Clientes") e prestadores de serviços qualificados ("Profissionais"). Não somos uma agência de contratação, empregador ou parte em qualquer contrato que possa ser formado entre Clientes e Profissionais.
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. Isenção de Responsabilidade</h2>
          <p>
            Não nos responsabilizamos pela qualidade, segurança, legalidade ou qualquer outro aspecto dos serviços prestados pelos Profissionais. Toda a negociação, acordo, execução do serviço e transações de pagamento são de responsabilidade exclusiva dos Clientes e Profissionais envolvidos.
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. Conduta do Usuário</h2>
          <p>
            Você concorda em usar o AliaObra apenas para fins legais e de maneira que não infrinja os direitos de, restrinja ou iniba o uso e gozo do site por qualquer terceiro.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">5. Modificações dos Termos</h2>
           <p>
            Reservamo-nos o direito de alterar estes termos a qualquer momento. Notificaremos sobre quaisquer alterações, publicando os novos termos neste site.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
