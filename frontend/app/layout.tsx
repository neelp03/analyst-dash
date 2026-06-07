import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analyst Dash",
  description: "Instant CSV analysis and anomaly detection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans antialiased">{children}</body>
    </html>
  );
}
