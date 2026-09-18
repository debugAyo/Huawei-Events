import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <BackgroundOrbs />
      <Navbar />
      <main className="relative flex-1">{children}</main>
      <Footer />
    </>
  );
}
