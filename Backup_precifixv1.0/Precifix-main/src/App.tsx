import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { SessionContextProvider } from "./components/SessionContextProvider";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { useExpenseNotifications } from './hooks/use-expense-notifications';

const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ProductCatalogPage = lazy(() => import("./pages/ProductCatalogPage"));
const ManageCostsPage = lazy(() => import("./pages/ManageCostsPage"));
const QuoteGenerationPage = lazy(() => import("./pages/QuoteGenerationPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PaymentMethodsPage = lazy(() => import("./pages/PaymentMethodsPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const QuoteViewPage = lazy(() => import("./pages/QuoteViewPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const DailyAgendaPage = lazy(() => import("./pages/DailyAgendaPage"));
const SalesPage = lazy(() => import("./pages/SalesPage"));
const NewSalePage = lazy(() => import("./pages/NewSalePage"));
const AccountsPayablePage = lazy(() => import("./pages/AccountsPayablePage"));


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SessionContextProvider>
            <AppContent />
          </SessionContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}


function AppContent() {
  useExpenseNotifications(); // Chamar o hook aqui

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground animate-pulse">Carregando Precifix...</p>
          </div>
        </div>
      }
    >
      <Routes>
        {/* Rota Pública para Visualização de Orçamento */}
        <Route path="/quote/view/:quoteId" element={<QuoteViewPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> {/* Nova Rota de Cadastro */}
        <Route
          path="/"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/manage-costs"
          element={
            <DashboardLayout>
              <ManageCostsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/products"
          element={
            <DashboardLayout>
              <ProductCatalogPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/services"
          element={
            <DashboardLayout>
              <ServicesPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/payment-methods"
          element={
            <DashboardLayout>
              <PaymentMethodsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/clients"
          element={
            <DashboardLayout>
              <ClientsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/agenda"
          element={
            <DashboardLayout>
              <CalendarPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/agenda/daily"
          element={
            <DashboardLayout>
              <DailyAgendaPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/generate-quote"
          element={
            <DashboardLayout>
              <QuoteGenerationPage />
            </DashboardLayout>
          }
        />
        {/* Novas Rotas de Vendas */}
        <Route
          path="/sales"
          element={
            <DashboardLayout>
              <SalesPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/sales/new"
          element={
            <DashboardLayout>
              <NewSalePage />
            </DashboardLayout>
          }
        />
        {/* Nova Rota de Contas a Pagar */}
        <Route
          path="/accounts-payable"
          element={
            <DashboardLayout>
              <AccountsPayablePage />
            </DashboardLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/billing"
          element={
            <DashboardLayout>
              <BillingPage />
            </DashboardLayout>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );

}

export default App;