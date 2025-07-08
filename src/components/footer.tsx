import Link from "next/link";
import { Wrench } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
            <Wrench className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary tracking-tighter">
            AliaObra
            </span>
        </div>
        <div className="text-center text-sm">
          <p className="max-w-3xl mx-auto mb-4">
            A AliaObra é uma plataforma que conecta clientes a prestadores de serviços. Não nos responsabilizamos pelos serviços prestados, acordos feitos ou pagamentos transacionados entre as partes. Nossa missão é facilitar o contato.
          </p>
          <div className="flex justify-center gap-4 mb-4">
             <Link href="/terms" className="hover:text-primary underline-offset-4 hover:underline">Termos de Serviço</Link>
             <Link href="/privacy" className="hover:text-primary underline-offset-4 hover:underline">Política de Privacidade</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} AliaObra. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
