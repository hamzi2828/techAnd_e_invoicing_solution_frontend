// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from 'react-hot-toast';
import '@fortawesome/fontawesome-free/css/all.css';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Invoice Pro",
  description: "Modern e-invoicing made simple — digital invoicing, tax compliance, and real-time tracking for growing businesses.",
  icons: {
    icon: [
      { url: "/Logo/Circular-1.png", type: "image/png" },
    ],
    apple: [
      { url: "/Logo/Square.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
        suppressHydrationWarning={true}
      >
        <Toaster position="top-center" />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}