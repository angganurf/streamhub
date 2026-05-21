import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Video, LayoutDashboard, Film, FolderOpen, Megaphone, Settings, LogOut } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Videos", href: "/admin/videos", icon: Film },
    { name: "Categories", href: "/admin/categories", icon: FolderOpen },
    { name: "Ads", href: "/admin/ads", icon: Megaphone },
    { name: "CDN Settings", href: "/admin/settings/cdn", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Video className="h-6 w-6 text-primary" />
            StreamHub Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary hover:text-primary transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center px-6 justify-between">
          <h2 className="font-semibold text-lg">Admin Panel</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.name || session.user.email}
            </span>
            <form action="/api/auth/sign-out" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          {children}
        </div>
      </main>
    </div>
  );
}
