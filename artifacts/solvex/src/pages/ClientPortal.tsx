import { DashboardLayout } from "@/components/DashboardLayout";
import { useGetMyProblems } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ClientPortal() {
  const { data: problems, isLoading } = useGetMyProblems();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-mono font-bold mb-2 text-primary uppercase">Client Portal</h1>
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Manage your intelligence requests and escrow status.</p>
          </div>
          <Link href="/post-problem">
            <Button className="font-mono uppercase tracking-widest">New Request</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground font-mono">Retrieving client logs...</div>
        ) : problems?.length === 0 ? (
           <div className="p-12 text-center border border-dashed border-border text-muted-foreground font-mono">
             No active requests. Initiate a new bounty to begin.
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {problems?.map(p => (
               <Card key={p.id} className="bg-card border-border">
                  <CardHeader className="py-4 border-b border-border bg-muted/20">
                    <div className="flex justify-between items-center">
                       <CardTitle className="font-mono text-lg">{p.title}</CardTitle>
                       <Badge variant="secondary" className="font-mono uppercase bg-accent text-accent-foreground">{p.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm font-mono">
                       <div>
                         <div className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">Escrow Locked</div>
                         <div className="text-green-500 font-bold">{p.paymentOffer} {p.currency}</div>
                       </div>
                       <div>
                         <div className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">Category</div>
                         <div className="uppercase text-primary">{p.category}</div>
                       </div>
                       <div>
                         <div className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">Deadline</div>
                         <div>{p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}</div>
                       </div>
                    </div>
                    <div className="pt-4 border-t border-border flex justify-end">
                       <Link href={`/problems/${p.id}`}>
                         <Button variant="outline" size="sm" className="font-mono uppercase tracking-widest text-xs">Review Status</Button>
                       </Link>
                    </div>
                  </CardContent>
               </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
