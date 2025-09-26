import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ML Osfin - Dispute Resolution Dashboard",
  description: "Advanced AI-powered dispute resolution and fraud detection platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-slate-50 to-blue-50`}
      >
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ML</span>
                  </div>
                  <span className="ml-3 text-xl font-semibold text-gray-900">Osfin AI</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-4">
                    <Link href="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                    <Link href="/analytics" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Analytics</Link>
                    <Link href="/chat" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">AI Chat</Link>
                    <Link href="/tools" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Tools</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
