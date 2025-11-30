import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "./toast-provider";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Calendar App",
  description: "A Next.js calendar application with recurring events support",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider />
        <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image 
                  src="/logo.svg" 
                  alt="Calendar App Logo" 
                  width={32} 
                  height={32}
                  className="w-8 h-8"
                />
                <h1 className="text-2xl font-bold">Calendar App</h1>
              </div>
              <div className="flex items-center space-x-6">
                <a href="/" className="hover:text-blue-200 transition font-medium">Calendar</a>
                <a href="/events" className="hover:text-blue-200 transition font-medium">Events</a>
                <a href="/events/new" className="bg-white text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-50 transition font-semibold shadow-md">
                  + New Event
                </a>
              </div>
            </div>  
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

