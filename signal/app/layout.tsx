import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal — Personalised tech learning",
  description:
    "Signal filters the noise in tech, surfaces what matters to your role, and teaches you the underlying concepts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-paper">{children}</div>
      </body>
    </html>
  );
}
