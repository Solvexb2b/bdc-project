import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useGetMe();
  const logoutParams = useLogout();
  const [location] = useLocation();

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Link href="/">
            <h1 className="text-xl font-mono text-primary font-bold">SolveX Terminal</h1>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/marketplace" className="block p-2 hover:bg-accent hover:text-accent-foreground rounded">Marketplace</Link>
          {user ? (
            <>
              <Link href="/library" className="block p-2 hover:bg-accent hover:text-accent-foreground rounded">Library</Link>
              <Link href="/portal" className="block p-2 hover:bg-accent hover:text-accent-foreground rounded">Client Portal</Link>
              <Link href="/post-problem" className="block p-2 hover:bg-accent hover:text-accent-foreground rounded">Post Problem</Link>
              {user.role === 'admin' && (
                <>
                  <div className="pt-4 pb-2 text-xs text-muted-foreground uppercase font-semibold">Admin Area</div>
                  <Link href="/owner" className="block p-2 hover:bg-accent hover:text-accent-foreground rounded">Owner Command Center</Link>
                  <Link href="/solver" className="block p-2 hover:bg-accent hover:text-accent-foreground rounded">Solver Dashboard</Link>
                  <Link href="/analytics" className="block p-2 hover:bg-accent hover:text-accent-foreground rounded">Analytics</Link>
                </>
              )}
            </>
          ) : (
            <Link href="/login" className="block p-2 hover:bg-accent hover:text-accent-foreground rounded">Login</Link>
          )}
        </nav>
        <div className="p-4 border-t">
          {user ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-mono truncate">{user.email}</span>
              <Button variant="outline" size="sm" onClick={() => logoutParams.mutate()} disabled={logoutParams.isPending}>Logout</Button>
            </div>
          ) : (
            <Link href="/login">
              <Button className="w-full">Login via Manus</Button>
            </Link>
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
