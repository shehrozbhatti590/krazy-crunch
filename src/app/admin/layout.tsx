import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Krazy Crunch",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0b0a0f]">{children}</div>;
}
