import "./globals.css";

export const metadata = {
  title: "AmadReally | Console Portfolio",
  description:
    "Interactive portfolio of AmadReally — a console & modern dashboard with GitHub API integration.",
  icons: {
    icon: "https://github.com/AmadReally.png",
    apple: "https://github.com/AmadReally.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
