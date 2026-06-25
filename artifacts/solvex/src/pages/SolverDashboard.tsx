import { DashboardLayout } from "@/components/DashboardLayout";
import { useListProblems } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function SolverDashboard() {
  const { data: problems, isLoading } = useListProblems({ status: "open" });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-mono font-bold mb-2 text-primary uppercase">Solver Terminal</h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Active bounties requiring resolution.</p>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground font-mono">Syncing active bounties...</div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-mono text-primary uppercase border-b border-border pb-2">Open Intelligence Requests</h2>
            {problems?.length === 0 ? (
               <div className="p-12 text-center border border-dashed border-border text-muted-foreground font-mono">
                 No open requests at this time.
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {problems?.map((p) => (
                  <Card key={p.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                           <CardTitle className="font-mono text-lg mb-2">{p.title}</CardTitle>
                           <div className="flex gap-2">
                             <Badge variant="outline" className="text-primary border-primary font-mono uppercase text-[10px]">{p.category}</Badge>
                           </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-mono font-bold text-green-500">{p.paymentOffer} {p.currency}</div>
                          <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">Escrow Ready</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-4 border-t border-border flex justify-between items-center bg-muted/20">
                       <span className="text-sm font-mono text-muted-foreground truncate max-w-[60%]">{p.description}</span>
                       <Link href={`/problems/${p.id}`}>
                         <Button variant="secondary" size="sm" className="font-mono uppercase tracking-widest text-xs">Engage</Button>
                       </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
