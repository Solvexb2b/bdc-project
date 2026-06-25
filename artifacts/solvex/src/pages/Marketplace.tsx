import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListProducts, useListProblems } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";

export default function Marketplace() {
  const { data: products, isLoading: loadingProducts } = useListProducts();
  const { data: problems, isLoading: loadingProblems } = useListProblems();

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-mono font-bold mb-6 text-primary uppercase">Unified Marketplace</h1>
      <Tabs defaultValue="vault" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="vault" className="font-mono uppercase">Paradox Vault</TabsTrigger>
          <TabsTrigger value="bounties" className="font-mono uppercase">Problem Bounties</TabsTrigger>
        </TabsList>
        <TabsContent value="vault">
          {loadingProducts ? <div className="text-muted-foreground">Accessing vault records...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map(p => (
                <Card key={p.id} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-mono text-lg">{p.name}</CardTitle>
                    <CardDescription className="uppercase tracking-widest text-xs text-primary">{p.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-mono">{p.priceEth} ETH</span>
                      <Link href={`/product/${p.id}`} className="text-sm text-primary hover:underline font-mono uppercase">Inspect Product -&gt;</Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="bounties">
          {loadingProblems ? <div className="text-muted-foreground">Fetching open bounties...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {problems?.map(p => (
                <Card key={p.id} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-mono text-lg">{p.title}</CardTitle>
                    <div className="flex gap-2 text-xs uppercase tracking-widest font-mono">
                      <span className="text-primary">{p.category}</span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-accent">{p.status}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-green-500">{p.paymentOffer} {p.currency || 'USD'}</span>
                      <Link href={`/problems/${p.id}`} className="text-sm text-primary hover:underline font-mono uppercase">View Details -&gt;</Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
