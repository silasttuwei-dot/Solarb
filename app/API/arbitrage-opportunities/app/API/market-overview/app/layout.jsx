'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Inter, Poppins } from 'next/font/google';
import OfflineBar from '@/components/OfflineBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins' });

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } } }));
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} color-scheme="dark">
      <body className="bg-[#0D0F11] text-white">
        <QueryClientProvider client={queryClient}>
          <OfflineBar />
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
