import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Huawei ICT Academy",
    template: "%s | Huawei ICT Academy",
  },
  description:
    "Discover, register for and manage events at Huawei ICT Academy.",
};

const NO_FOUC = `(function(){try{var c=document.cookie.match(/(?:^|; )theme=([^;]+)/);var t=c&&(c[1]==='dark'||c[1]==='light')?c[1]:null;if(!t)t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var d=t==='dark';document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=t;document.cookie='theme='+t+'; path=/; max-age=31536000; samesite=lax';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FOUC }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
