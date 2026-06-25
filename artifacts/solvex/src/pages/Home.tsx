import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b p-4 flex justify-between items-center bg-card">
        <h1 className="text-2xl font-mono text-primary font-bold">SolveX Terminal</h1>
        <div className="space-x-4">
          <Link href="/marketplace"><Button variant="ghost">Marketplace</Button></Link>
          <Link href="/login"><Button>Login</Button></Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-4xl md:text-6xl font-bold font-mono text-primary mb-6">Cryptographic Precision Meets Impossible Problems</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          An elite, owner-operated intellectual marketplace. Access the Paradox Vault or post bounties for unsolvable problems.
        </p>
        <div className="flex gap-4">
          <Link href="/marketplace"><Button size="lg" className="font-mono uppercase tracking-wider">Enter Marketplace</Button></Link>
          <Link href="/post-problem"><Button size="lg" variant="outline" className="font-mono uppercase tracking-wider">Post a Bounty</Button></Link>
        </div>
      </main>
    </div>
  );
}
