import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import SupportedExams from "@/pages/supportedExams";
import Subjects from "@/pages/subjects";
import Materials from "@/pages/materials";
import Notes from "@/pages/notes";
import PYQ from "@/pages/pyq";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/exams" component={SupportedExams} />
            <Route path="/subjects" component={Subjects} />
            <Route path="/materials" component={Materials} />
            <Route path="/notes" component={Notes} />
            <Route path="/pyq" component={PYQ} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
