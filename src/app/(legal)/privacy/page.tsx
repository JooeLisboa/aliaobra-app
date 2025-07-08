
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Política de Privacidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground prose prose-lg dark:prose-invert">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <h2 className="text-xl font-semibold text-foreground">1. Coleta de Informações</h2>
          <p>
            Coletamos informações que você nos fornece diretamente, como ao criar uma conta, incluindo seu nome, e-mail e outras informações de perfil. Também coletamos informações sobre seu uso da plataforma, como mensagens e transações.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. Uso das Informações</h2>
          <p>
            Usamos as informações coletadas para operar, manter e fornecer os recursos e a funcionalidade do AliaObra, para nos comunicarmos com você, para monitorar e melhorar nossos serviços e para personalizar o conteúdo.
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. Compartilhamento de Informações</h2>
          <p>
            Suas informações de perfil, como nome e categoria, são visíveis para outros usuários da plataforma para facilitar a conexão. Não compartilharemos suas informações pessoais com terceiros sem o seu consentimento, exceto conforme exigido por lei.
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. Segurança</h2>
          <p>
            Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum sistema de segurança é impenetrável e não podemos garantir a segurança de nossos sistemas 100%.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">5. Seus Direitos</h2>
           <p>
             Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento através das configurações do seu perfil ou entrando em contato conosco.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
