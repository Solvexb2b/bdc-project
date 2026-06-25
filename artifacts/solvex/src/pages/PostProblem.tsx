import { DashboardLayout } from "@/components/DashboardLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProblem } from "@workspace/api-client-react";
import { useLocation } from "wouter";

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  description: z.string().min(20, "Description must be detailed enough (20+ chars)."),
  category: z.string(),
  paymentOffer: z.coerce.number().min(1, "Offer must be greater than 0"),
  deadline: z.string().optional(),
});

export default function PostProblem() {
  const createProblem = useCreateProblem();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "operational",
      paymentOffer: 1000,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createProblem.mutate({ data: values }, {
      onSuccess: (data) => {
        setLocation(`/problems/${data.id}`);
      }
    });
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-mono font-bold mb-2 text-primary uppercase">Post Bounty</h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Initiate secure escrow protocol for problem resolution.</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs tracking-widest">Problem Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Optimize ZK-Rollup Proof Generation" className="font-mono bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase text-xs tracking-widest">Classification</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="font-mono bg-background">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fundamental" className="font-mono">Fundamental</SelectItem>
                          <SelectItem value="ai" className="font-mono">Artificial Intelligence</SelectItem>
                          <SelectItem value="operational" className="font-mono">Operational</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentOffer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase text-xs tracking-widest">Bounty (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" className="font-mono bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs tracking-widest">Detailed Specifications</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide exhaustive context and constraints..." 
                        className="min-h-[200px] font-mono bg-background" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-border">
                <Button type="submit" disabled={createProblem.isPending} className="w-full font-mono uppercase tracking-widest" size="lg">
                  {createProblem.isPending ? 'Committing...' : 'Commit to Escrow'}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4 font-mono">Funds will be secured via Stripe Escrow Protocol.</p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}
