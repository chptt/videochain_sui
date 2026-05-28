import type { Metadata } from "next";
import "./globals.css";
import { SuiProviders } from "@/components/SuiProviders";

export const metadata: Metadata = {
  title: "Video Sui - Fresh",
  description: "Decentralized video platform on Sui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SuiProviders>{children}</SuiProviders>
      </body>
    </html>
  );
}
