import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <Sidebar />
      {/* 
        Main layout structure. 
        Note: The RightPanel is injected dynamically by the pages that need it 
        to ensure context-specific data can be rendered there easily.
      */}
      <div className="pl-64 flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
