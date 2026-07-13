import "./globals.css";
import { Playfair_Display, DM_Sans, DM_Mono, Instrument_Serif } from "next/font/google";
import Providers from "./providers";
import Shell from "@/components/Shell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-reflect",
  display: "swap",
});

export const metadata = {
  title: "Rafli Life Tracker · A quieter way to move forward",
  description:
    "Personal life operating system for Rafli — career, finance, skills, goals and weekly reflection in one calm place.",
  themeColor: "#f5f2ea",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
