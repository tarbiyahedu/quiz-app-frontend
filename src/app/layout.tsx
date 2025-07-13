import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import ClientProvider from "./providers";

const inter = Inter({ subsets: ["latin"] });

export { metadata } from "./metadata";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.className
      )}>
        <ClientProvider>
          <Navbar/>
          {children}
          <Footer/>
          <Toaster />
        </ClientProvider>
      </body>
    </html>
  );
}
