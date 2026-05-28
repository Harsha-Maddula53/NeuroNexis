import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <>
      <AppShell>
        {children}
      </AppShell>
      <Toaster position="top-right" />
    </>
  );
}
