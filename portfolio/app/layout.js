import "./globals.css";

export const metadata = {
  title: "Naim Jamalullail | Console Portfolio",
  description:
    "Interactive portfolio of Naim Jamalullail — a console & modern dashboard with GitHub API integration.",
  icons: {
    icon: "https://github.com/naimjamalullail.png",
    apple: "https://github.com/naimjamalullail.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
