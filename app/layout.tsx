"use client";

import { SessionProvider } from 'next-auth/react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import "./styles/globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <Header />
            <main className='min-h-screen'>{children}</main>
            <Footer />
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}