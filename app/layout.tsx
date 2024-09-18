import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Consulta Tipo de Cambio',
  description: 'Una aplicación para consultar el tipo de cambio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <header>
          <h1>Consulta Tipo de Cambio</h1>
          <nav>
            <ul>
              <li><a href="/">Inicio</a></li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; 2024 Test Pronet</p>
        </footer>
      </body>
    </html>
  );
}
