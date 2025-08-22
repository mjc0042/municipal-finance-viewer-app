import { useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
//import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
//import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "./store/auth";
//import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Finance from "@/pages/finance";
import Designer from "@/pages/designer";
//import Profile from "@/pages/profile";
//import Subscribe from "@/pages/subscribe";
import NotFound from "@/pages/not-found";
/*
function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/finance" component={Finance} />
          <Route path="/designer" component={Designer} />
          <Route path="/profile" component={Profile} />
          <Route path="/subscribe" component={Subscribe} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}*/

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/finance" component={Finance} />
      <Route path="/designer" component={Designer} />
      <Route component={NotFound} />
    </Switch>
  );
}
/*
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}*/

function App() {

  //const setCsrfToken = useAuthStore((state) => state.setCsrfToken);

  // useEffect(() => {
  //   void setCsrfToken()
  // }, [setCsrfToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
