
'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Provider } from '@/lib/types';
import { cn } from '@/lib/utils';

const PlasticHelmet = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={cn("w-6 h-6", className)}>
        <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.5V6.5A4.5 4.5 0 0 0 12 2Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1"/>
        <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V9h9V6.5A4.5 4.5 0 0 0 12 2Z" fill="#FCD34D" />
    </svg>
);

const GoldHelmet = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#gold-gradient)" className={cn("w-6 h-6", className)}>
    <defs>
      <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>
    <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.5V6.5A4.5 4.5 0 0 0 12 2Z" stroke="#DAA520" strokeWidth="0.5"/>
  </svg>
);

const EmeraldHelmet = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#emerald-gradient)" className={cn("w-6 h-6", className)}>
    <defs>
      <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="50%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.5V6.5A4.5 4.5 0 0 0 12 2Z" stroke="#065F46" strokeWidth="0.5"/>
  </svg>
);

export function PlanIcon({ plan, className }: { plan?: Provider['plan'], className?: string }) {
    if (!plan) return null;

    const iconMap = {
        'básico': {
            icon: <PlasticHelmet className={className} />,
            tooltip: 'Plano Básico',
        },
        'profissional': {
            icon: <GoldHelmet className={className} />,
            tooltip: 'Assinante: Plano Profissional',
        },
        'agência': {
            icon: <EmeraldHelmet className={className} />,
            tooltip: 'Assinante: Plano Agência',
        },
    };

    const iconData = iconMap[plan];
    if (!iconData) return null;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span>{iconData.icon}</span>
            </TooltipTrigger>
            <TooltipContent>
                <p>{iconData.tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}
