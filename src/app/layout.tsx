import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '1delivery · El Mandado Motorizado (Anaco)',
  description: 'Despacho ultrarrápido de motorizados y repuestos en Anaco, Anzoátegui',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
