import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PhoneFrame } from "@/components/layout/PhoneFrame";

export const metadata: Metadata = {
  title: "TIPS-26™ · Thomas-Irawan Predictive Stochastics",
  description:
    "WM 2026 Vorhersage-App · Monte-Carlo-Simulation mit 9-Faktoren-Ensemble",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TIPS-26",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a1628",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
