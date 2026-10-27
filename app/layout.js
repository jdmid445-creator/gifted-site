import './globals.css';
import MotionObserver from '@/components/MotionObserver';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import { site } from '@/lib/site';

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: `gifted: ${site.tagline}`, template: '%s · gifted' },
  description: site.description,
  openGraph: { title: `gifted: ${site.tagline}`, description: site.description, images: ['/og.png'], type: 'website' },
  twitter: { card: 'summary_large_image', title: `gifted: ${site.tagline}`, description: site.description, images: ['/og.png'] },
};

export const viewport = { themeColor: '#0B0B0C', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@400;500;600&display=swap" />
      </head>
      <body>
        <a href="#main" className="sr-only">Skip to content</a>
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MotionObserver />
        </Providers>
      </body>
    </html>
  );
}
