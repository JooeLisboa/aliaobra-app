// src/app/profile/layout.tsx
'use client';

import { Suspense } from 'react';
import { LoaderCircle } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <LoaderCircle className="w-8 h-8 animate-spin" />
    </div>
  );
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}
