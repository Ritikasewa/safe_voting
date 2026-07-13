import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Voting DAO",
  description: "On-chain proposal voting.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sourceSerif.variable} ${inter.variable}`} style={{ fontFamily: "var(--font-inter)" }}>
        {children}
      </body>
    </html>
  );
}