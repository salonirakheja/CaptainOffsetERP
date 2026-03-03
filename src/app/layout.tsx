import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/ui/Sidebar';
import ToastProvider from '@/components/ui/Toast';
import SessionSelector from '@/components/SessionSelector';
import GlobalSearch from '@/components/ui/GlobalSearch';
import { getActivePeople } from '@/lib/db/people';
import { getAllFactories } from '@/lib/db/factories';

export const metadata: Metadata = {
  title: 'Captain Offset ERP',
  description: 'Factory ERP for Captain Offset Printing & Packaging',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let people: { id: number; name: string; role: string; factoryId: number }[] = [];
  let factories: { id: number; name: string; code: string }[] = [];
  try {
    [people, factories] = await Promise.all([
      getActivePeople(),
      getAllFactories(),
    ]);
  } catch {
    // DB unavailable at build time
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider />
        <SessionSelector people={people} factories={factories} />
        <Sidebar />
        <main className="ml-0 md:ml-56 min-h-screen print-full">
          <div className="hidden md:flex justify-end px-6 py-3 no-print">
            <GlobalSearch />
          </div>
          <div className="p-4 md:p-6 pt-16 md:pt-3 max-w-[1400px]">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
