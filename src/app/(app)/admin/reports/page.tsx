import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.isAdmin) {
    redirect("/dashboard");
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: true,
      reported: true,
      message: true,
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Admin Reports</h1>
        <p className="text-sm text-zinc-400 mt-1">Review user-submitted reports and moderation logs.</p>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <p className="text-zinc-500 text-sm">No reports to review.</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 text-sm text-zinc-300">
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold text-zinc-100">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                      report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                      report.status === 'dismissed' ? 'bg-zinc-800 text-zinc-400' : 'bg-green-500/20 text-green-500'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div><span className="font-semibold text-zinc-100">Reporter:</span> {report.reporter.name} ({report.reporter.email})</div>
                  <div><span className="font-semibold text-zinc-100">Reported User/Persona:</span> {report.reported.name} ({report.reported.email})</div>
                  <div><span className="font-semibold text-zinc-100">Reason:</span> {report.reason}</div>
                  <div><span className="font-semibold text-zinc-100">Date:</span> {new Date(report.createdAt).toLocaleString()}</div>
                  {report.messageId && (
                    <div>
                      <span className="font-semibold text-zinc-100">Context:</span>{' '}
                      <a href={`/chat/${report.message?.conversationId}`} className="text-emerald-500 hover:underline">
                        View Conversation
                      </a>
                    </div>
                  )}
                </div>
                
                {report.status === 'pending' && (
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <form action={`/api/admin/reports/${report.id}/action`} method="POST">
                      <input type="hidden" name="action" value="reviewed" />
                      <button type="submit" className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-md px-3 py-2 font-medium">Mark Reviewed</button>
                    </form>
                    <form action={`/api/admin/reports/${report.id}/action`} method="POST">
                      <input type="hidden" name="action" value="dismissed" />
                      <button type="submit" className="w-full text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md px-3 py-2 font-medium">Dismiss</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
