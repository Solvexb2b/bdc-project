import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-mono font-bold mb-2 text-primary uppercase">Analytics Telemetry</h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Platform performance metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card border-border min-h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Revenue Chart Offline</div>
          </Card>
          <Card className="bg-card border-border min-h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Problem Distribution Offline</div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
