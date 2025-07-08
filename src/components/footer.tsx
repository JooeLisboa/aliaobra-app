import Link from "next/link";
import { Wrench } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
             <Wrench className="h-6 w-6 text-primary" />
             <span className="text-lg font-bold text-primary tracking-tighter">
               AliaObra
             </span>
          </div>
          <p className="max-w-3xl mx-auto mb-4">
            A AliaObra é uma plataforma que conecta clientes a prestadores de serviços na área da construção civil. Não nos responsabilizamos pelos serviços prestados, acordos feitos ou pagamentos transacionados entre as partes. Nossa missão é facilitar o contato.
          </p>
          <p>&copy; {new Date().getFullYear()} AliaObra. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
