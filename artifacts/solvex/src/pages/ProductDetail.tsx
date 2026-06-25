import { DashboardLayout } from "@/components/DashboardLayout";
import { useParams } from "wouter";
import { useGetProduct } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: product, isLoading } = useGetProduct(id);

  if (isLoading) return <DashboardLayout><div className="p-8 text-muted-foreground">Decrypting vault entry...</div></DashboardLayout>;
  if (!product) return <DashboardLayout><div className="p-8 text-destructive">Product not found in vault.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-start border-b border-border pb-6">
          <div>
            <Badge variant="outline" className="text-primary border-primary mb-4 font-mono uppercase">{product.category}</Badge>
            <h1 className="text-4xl font-mono font-bold mb-2">{product.name}</h1>
            <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
              ID: {product.id} | Access Tier: Tier 1
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-mono text-primary uppercase border-b border-border pb-2">Abstract</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-mono text-primary uppercase border-b border-border pb-2">Expected Impact</h2>
              <p className="text-muted-foreground">{product.impact || 'Classified. Purchase required for impact assessment.'}</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-mono text-primary uppercase border-b border-border pb-2">Solution Material</h2>
              <Card className="bg-muted/50 border-border relative overflow-hidden">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-10">
                  <div className="text-center space-y-4">
                    <p className="font-mono text-primary uppercase tracking-widest">Access Restricted</p>
                    <p className="text-sm text-muted-foreground">Acquire clearance to decrypt.</p>
                  </div>
                </div>
                <CardContent className="p-6 font-mono text-sm blur-sm">
                  0x7f83b1657ff1fc53b92dc18148a1d65df15eba1eca7d1f4bb96a2c0712808b...
                  {product.solution}
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-primary">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-mono uppercase text-sm tracking-widest text-muted-foreground">Acquisition Protocol</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-muted-foreground">ETH</span>
                    <span className="text-lg">{product.priceEth}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-muted-foreground">USDC</span>
                    <span className="text-lg">{product.priceUsdc}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-muted-foreground">BTC</span>
                    <span className="text-lg">{product.priceBtc}</span>
                  </div>
                </div>
                <Button className="w-full font-mono uppercase tracking-widest" size="lg">
                  Initiate Transfer
                </Button>
              </CardContent>
            </Card>
            
            <div className="text-xs font-mono text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>Verification</span>
                <span className="text-primary">Secured</span>
              </div>
              <div className="flex justify-between">
                <span>Deliverable</span>
                <span>Immediate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
