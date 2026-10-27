import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { site } from '@/lib/site';

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: `gifted: ${site.tagline}`, template: '%s · gifted' },
  description: site.description,
  openGraph: {
    title: `gifted: ${site.tagline}`,
    description: site.description,
    images: ['/og.png'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `gifted: ${site.tagline}`, description: site.description, images: ['/og.png'] },
};

export const viewport = { themeColor: '#0E0A14', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" />
      </head>
      <body>
        <a href="#main" className="sr-only">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
