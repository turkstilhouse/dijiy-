import "./globals.css";

export const metadata = {
  title: "DİJİJY — Dijital İpek Yolu",
  description: "DİJİJY modular digital ecosystem control surface."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}