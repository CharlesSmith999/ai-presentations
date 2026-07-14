import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Presentation Consultant",
  description: "The intelligence behind your presentation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
