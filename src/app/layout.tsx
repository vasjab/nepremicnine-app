import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import '@/index.css';

export const metadata: Metadata = {
  title: 'hemma - Find your next home',
  description: 'Browse rental and sale listings with interactive map view, messaging, and more.',
  openGraph: {
    title: 'hemma - Find your next home',
    description: 'Browse rental and sale listings with interactive map view, messaging, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'hemma - Find your next home',
    description: 'Browse rental and sale listings with interactive map view, messaging, and more.',
  },
  icons: {
    icon: 'https://storage.googleapis.com/gpt-engineer-file-uploads/lcpJ9YZW2jPNkGzppyBEmoHDvXK2/uploads/1766279406641-letter-h.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
