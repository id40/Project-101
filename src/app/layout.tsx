import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NAVIA · Spatial Campus OS | Lovely Professional University',
  description: 'Explore · Navigate · Belong — NAVIA real-time 3D GIS campus digital twin with building extrusion, live phone GPS walk mode, indoor maps, and Gemini AI assistant.',
  manifest: '/manifest.json',
  icons: {
    icon: '/navia-monogram.png',
    apple: '/navia-monogram.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#635BFF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>" />
      </head>
      <body className="h-full bg-[#0F172A] text-slate-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
