import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ensure user record exists in DB
  let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        avatarUrl: user.user_metadata?.avatar_url || null,
      },
    });
  }

  if (!dbUser.onboardingDone) redirect("/onboarding");

  const [tasksDue, upcomingInterviews, unreadNotifications] = await Promise.all([
    prisma.task.count({
      where: {
        userId: user.id,
        status: { in: ["TODO", "IN_PROGRESS"] },
        dueDate: { lte: new Date(Date.now() + 86400000) },
      },
    }),
    prisma.interview.count({
      where: {
        userId: user.id,
        scheduledAt: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) },
        status: "SCHEDULED",
      },
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        user={{ name: dbUser.name, email: dbUser.email, avatarUrl: dbUser.avatarUrl }}
        tasksDue={tasksDue}
        upcomingInterviews={upcomingInterviews}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header notificationCount={unreadNotifications} />
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-7xl py-6 px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
