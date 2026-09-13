import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Order Management',
  description: 'Gestión de clientes, productos y órdenes',
};

const links = [
  { href: '/customers', label: 'Clientes' },
  { href: '/products', label: 'Productos' },
  { href: '/orders', label: 'Órdenes' },
];

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <Link href="/" className="font-semibold text-gray-900">
              Order Management
            </Link>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-gray-900">
                {l.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
