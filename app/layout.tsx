import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-commerce Admin Dashboard",
  description: "Full-featured admin dashboard for e-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" data-density="default" data-color-mode="apparent" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Public+Sans:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('dashboard-theme')||'emerald';var m=localStorage.getItem('dashboard-mode')||'light';var f=parseInt(localStorage.getItem('dashboard-font-size'),10);var s=(!isNaN(f)&&f>=12&&f<=22)?f:16;var ff=localStorage.getItem('dashboard-font-family')||'geist';var ffMap={geist:'var(--font-geist-sans), system-ui, sans-serif',inter:"'Inter', system-ui, sans-serif",public_sans:"'Public Sans', system-ui, sans-serif",dm_sans:"'DM Sans', system-ui, sans-serif"};var dir=localStorage.getItem('dashboard-direction')||'ltr';var density=localStorage.getItem('dashboard-density')||'default';var colorMode=localStorage.getItem('dashboard-color-mode')||'apparent';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.setProperty('--user-font-size',String(s));document.documentElement.style.setProperty('--user-font-family',ffMap[ff]||ffMap.geist);document.documentElement.setAttribute('dir',dir==='rtl'?'rtl':'ltr');document.documentElement.setAttribute('data-density',density==='compact'?'compact':'default');document.documentElement.setAttribute('data-color-mode',colorMode==='integrate'?'integrate':'apparent');if(m==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
