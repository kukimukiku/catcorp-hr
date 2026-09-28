import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "CatCorp HR",
  description: "Cat Employee Management System"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <Link href="/" className="brand">CatCorp management system</Link>
          <span>Feline Employee Management System</span>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
