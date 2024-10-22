import Header from './components/common/Header';
import Footer from './components/common/Footer';
import "./styles/globals.css";
import React from 'react';
import { Metadata } from 'next';
import Providers from './components/Providers';

export const metadata: Metadata = {
  title: 'Miniverse Studios',
  description: 'Miniverse Studios Homepage'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main>
            <Header />
            <main className='min-h-screen'>{children}</main>
            <Footer />
          </main>
        </Providers>
      </body>
    </html>
  )
}