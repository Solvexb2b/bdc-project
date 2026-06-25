import { DashboardLayout } from "@/components/DashboardLayout";
import { useParams } from "wouter";
import { useGetProblem } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProblemDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { data: problem, isLoading } = useGetProblem(id.toString(), { query: { enabled: !!id } });

  if (isLoading) return <DashboardLayout><div className="p-8 text-muted-foreground font-mono">Retrieving problem intel...</div></DashboardLayout>;
  if (!problem) return <DashboardLayout><div className="p-8 text-destructive font-mono">Intel not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-start border-b border-border pb-6">
          <div>
            <div className="flex gap-2 mb-4">
              <Badge variant="outline" className="text-primary border-primary font-mono uppercase">{problem.category}</Badge>
              <Badge variant="secondary" className="font-mono uppercase bg-accent text-accent-foreground">{problem.status}</Badge>
            </div>
            <h1 className="text-4xl font-mono font-bold mb-2">{problem.title}</h1>
            <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-4">
              <span>Bounty ID: {problem.id}</span>
              <span>Deadline: {problem.deadline ? new Date(problem.deadline).toLocaleDateString() : 'Open'}</span>
            </div>
          </div>
          <div className="text-right bg-card border border-border p-4 rounded">
            <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Bounty Offer</div>
            <div className="text-3xl font-mono font-bold text-green-500">{problem.paymentOffer} {problem.currency || 'USD'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-mono text-primary uppercase border-b border-border pb-2">Problem Statement</h2>
              <div className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {problem.description}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-mono text-primary uppercase border-b border-border pb-2">Submitted Solutions</h2>
              <div className="p-8 text-center border border-dashed border-border text-muted-foreground font-mono uppercase text-sm">
                No solutions authorized for display.
              </div>
            </section>
          </div>

          <div className="space-y-6">
             <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-mono uppercase text-sm tracking-widest text-muted-foreground">Escrow Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between font-mono text-sm border-b border-border pb-2 mb-2">
                  <span>Status</span>
                  <span className="text-accent">Pending Deposit</span>
                </div>
                <div className="flex items-center justify-between font-mono text-sm">
                  <span>Amount</span>
                  <span>{problem.paymentOffer} {problem.currency || 'USD'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-mono uppercase text-sm tracking-widest text-muted-foreground">Negotiation Protocol</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="p-4 text-center border border-dashed border-border text-muted-foreground font-mono text-xs uppercase">
                    Comm channel inactive.
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
