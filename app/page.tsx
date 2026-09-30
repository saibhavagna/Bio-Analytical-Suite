'use client';

import dynamic from 'next/dynamic';
import { DockingProvider } from '@/context/DockingContext';

// Dynamically import the heavy client-side AppShell (which contains Three.js and D3.js) with SSR disabled
const AppShell = dynamic(
  () => import('@/components/layout/AppShell').then((mod) => mod.AppShell),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0B0F13] text-[#A0AEC0] font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#48CAE4] border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING BIO-ANALYTICAL WORKSTATION...</span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <DockingProvider>
      <AppShell />
    </DockingProvider>
  );
}

