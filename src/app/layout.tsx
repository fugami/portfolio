import type { Metadata } from "next";
import { Caveat, EB_Garamond } from "next/font/google";
import "./globals.css";

// Free fallback for the Adobe "Ernie" handwriting face until the kit is added.
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
});

export const metadata: Metadata = {
  title: "Jordan Mitchell — Creative Timeline",
  description: "Projects and roles. A creative timeline by Jordan Mitchell.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adobeKitId = process.env.NEXT_PUBLIC_ADOBE_KIT_ID;

  return (
    <html lang="en" className={`${caveat.variable} ${ebGaramond.variable}`}>
      <head>
        {adobeKitId ? (
          // eslint-disable-next-line @next/next/no-page-custom-font
          <link rel="stylesheet" href={`https://use.typekit.net/${adobeKitId}.css`} />
        ) : null}
      </head>
      <body>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
