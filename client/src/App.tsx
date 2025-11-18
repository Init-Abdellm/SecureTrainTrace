import { Switch, Route, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { LanguageSelector } from "@/components/language-selector";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import TrainingsList from "@/pages/trainings-list";
import TrainingDetail from "@/pages/training-detail";
import TrainingForm from "@/pages/training-form";
import TraineeForm from "@/pages/trainee-form";
import ExcelUpload from "@/pages/excel-upload";
import Analytics from "@/pages/analytics";
import Verification from "@/pages/verification";
import Landing from "@/pages/landing";
import PublicVerification from "@/pages/public-verification";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/" component={Landing} />
      <Route path="/verify" component={PublicVerification} />
      <Route path="/verify/:id" component={Verification} />

      {/* Admin routes */}
      <Route path="/admin">
        {isAuthenticated ? <Dashboard /> : <Login />}
      </Route>
      <Route path="/admin/trainings">
        {isAuthenticated ? <TrainingsList /> : <Login />}
      </Route>
      <Route path="/admin/trainings/new">
        {isAuthenticated ? <TrainingForm /> : <Login />}
      </Route>
      <Route path="/admin/trainings/:id/edit">
        {isAuthenticated ? <TrainingForm /> : <Login />}
      </Route>
      <Route path="/admin/trainings/:id/upload">
        {isAuthenticated ? <ExcelUpload /> : <Login />}
      </Route>
      <Route path="/admin/trainings/:id">
        {isAuthenticated ? <TrainingDetail /> : <Login />}
      </Route>
      <Route path="/admin/trainees/:id/edit">
        {isAuthenticated ? <TraineeForm /> : <Login />}
      </Route>
      <Route path="/admin/analytics">
        {isAuthenticated ? <Analytics /> : <Login />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const { t, i18n } = useTranslation();
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const isAdminRoute = location.startsWith("/admin");
  const showSidebar = isAuthenticated && isAdminRoute;
  const isRTL = i18n.language === 'ar';

  if (isLoading) {
    return (
      <>
        <Toaster />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">{t("common.loading")}</div>
        </div>
      </>
    );
  }

  if (!showSidebar) {
    return (
      <>
        <Toaster />
        <Router />
      </>
    );
  }

  return (
    <>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className={`flex h-screen w-full bg-white ${isRTL ? 'flex-row-reverse' : ''}`}>
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className={`flex items-center justify-between h-12 px-4 border-b border-border bg-white shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <SidebarTrigger data-testid="button-sidebar-toggle" className="h-8 w-8" />
                <div className="text-sm font-bold text-foreground">
                  HSE New Generation Platform
                </div>
              </div>
              <LanguageSelector />
            </header>
            <main className="flex-1 overflow-y-auto bg-[#F3F2F2]">
              <Router />
            </main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
