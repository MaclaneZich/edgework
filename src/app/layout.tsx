import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: { default: "Edgework", template: "%s · Edgework" },
  description: "Interview prep for quantitative trading assessments: probability, expected value, logic, market making, and timed mocks.",
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0e13" },
    { media: "(prefers-color-scheme: light)", color: "#f6f5f0" },
  ],
};

/** Applies the saved theme before first paint so there is no flash. */
const themeScript = `
(function(){try{
  var raw=localStorage.getItem('edgework-ui');var ui=raw?JSON.parse(raw):{};
  var theme=ui.theme||'dark';
  if(theme==='system'){theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
  var root=document.documentElement;
  if(theme==='dark'){root.classList.add('dark');}else{root.classList.remove('dark');}
  if(ui.fontSize){root.setAttribute('data-font',ui.fontSize);}
  if(ui.reducedMotion==='reduce'){root.setAttribute('data-motion','reduce');}
}catch(e){document.documentElement.classList.add('dark');}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
