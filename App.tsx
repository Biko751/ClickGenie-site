import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth-context";

// Layout components
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Pages
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import HowItWorks from "@/pages/how-it-works";
import Testimonials from "@/pages/testimonials";
import NotFound from "@/pages/not-found";
import { ReactNode } from "react";

// Main layout component
function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/how-it-works" component={HowItWorks} />
            <Route path="/testimonials" component={Testimonials} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/dashboard" component={Dashboard} />
            <Route component={NotFound} />
          </Switch>
        </MainLayout>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
