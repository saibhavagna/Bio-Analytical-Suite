import type {Metadata} from 'next';
import {IBM_Plex_Sans, IBM_Plex_Mono} from 'next/font/google';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Bio-Analytical Suite — Molecular Docking & Computational Chemistry',
  description:
    'A browser-based molecular docking research workstation for computational chemistry, binding-site analysis, ligand screening, and interaction analysis.',
  openGraph: {
    title: 'Bio-Analytical Suite — Molecular Docking & Computational Chemistry',
    description:
      'A browser-based molecular docking research workstation for computational chemistry, binding-site analysis, ligand screening, and interaction analysis.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bio-Analytical Suite — Molecular Docking & Computational Chemistry',
    description:
      'A browser-based molecular docking research workstation for computational chemistry, binding-site analysis, ligand screening, and interaction analysis.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans bg-[#0B0F13] text-[#EDF2F7] antialiased select-none overflow-hidden h-screen w-screen`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

