import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/ui/Sidebar';
import ToastProvider from '@/components/ui/Toast';
import SessionSelector from '@/components/SessionSelector';
import { getActivePeople } from '@/lib/db/people';

export const metadata: Metadata = {
  title: 'Captain Offset ERP',
  description: 'Factory ERP for Captain Offset Printing & Packaging',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const people = await getActivePeople();

  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider />
        <SessionSelector people={people} />
        <Sidebar />
        <main className="ml-56 min-h-screen print-full">
          <div className="p-6 max-w-[1400px]">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
