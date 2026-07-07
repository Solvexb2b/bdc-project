import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import ProblemDetail from "./pages/ProblemDetail";
import PostProblem from "./pages/PostProblem";
import BrainConsole from "./pages/BrainConsole";
import ChallengeHub from "./pages/ChallengeHub";

const queryClient = new QueryClient();

const Placeholder = ({ name }: { name: string }) => <div className="p-8"><h1 className="text-2xl font-mono text-primary mb-4">{name}</h1><p className="text-muted-foreground">Module coming online shortly.</p></div>;

import { DashboardLayout } from "./components/DashboardLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/problems/:id" component={ProblemDetail} />
      <Route path="/post-problem" component={PostProblem} />
      <Route path="/brain" component={BrainConsole} />
      <Route path="/challenges" component={ChallengeHub} />
      <Route path="/library" component={() => <DashboardLayout><Placeholder name="User Library" /></DashboardLayout>} />
      <Route path="/solver" component={() => <DashboardLayout><Placeholder name="Solver Dashboard" /></DashboardLayout>} />
      <Route path="/portal" component={() => <DashboardLayout><Placeholder name="Client Portal" /></DashboardLayout>} />
      <Route path="/owner" component={() => <DashboardLayout><Placeholder name="Owner Command Center" /></DashboardLayout>} />
      <Route path="/analytics" component={() => <DashboardLayout><Placeholder name="Analytics" /></DashboardLayout>} />
      <Route path="/login" component={() => <div className="min-h-screen flex items-center justify-center bg-background"><a href="/api/auth/login" className="text-primary font-mono text-xl hover:underline">Authenticate via Manus</a></div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
