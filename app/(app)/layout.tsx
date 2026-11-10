import Nav from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-24 pt-6">
      <Nav />
      <main className="mt-6 flex-1">{children}</main>
    </div>
  );
}
