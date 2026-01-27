import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { EmailConfirmation } from './pages/auth/EmailConfirmation'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { UpdatePassword } from './pages/auth/UpdatePassword'
import { MainLayout } from './layouts/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { Profile } from './pages/Profile'
import { ThemeProvider } from './contexts/ThemeContext'
import AccountsPage from "./pages/financial/AccountsPage";
import AccountDetailsPage from "./pages/financial/AccountDetailsPage";
import AccountsPayable from './pages/AccountsPayable'
import AccountsReceivable from './pages/financial/AccountsReceivable';
import { MyCompany } from './pages/MyCompany'
import { Products } from './pages/cadastros/Products'
import { Services } from './pages/cadastros/Services'
import { Clients } from './pages/cadastros/Clients'
import { FinancialOverview } from './pages/FinancialOverview'
import { DilutionCalculator } from './pages/tools/DilutionCalculator'
import { ProductCostCalculator } from './pages/tools/ProductCostCalculator'
import FinancialCategories from './pages/settings/FinancialCategories';
import { MyFiles } from './pages/settings/MyFiles';
import Settings from './pages/settings/Settings';
import { VisualTest } from './pages/tests/VisualTest';
import { AgendaPage } from './pages/AgendaPage';


import { ProfileMenu } from './pages/ProfileMenu'
import { MobileMenu } from './pages/MobileMenu'
import { ScrollToTop } from './components/ScrollToTop'
import { Toaster } from './components/ui/sonner'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile-menu" element={<ProfileMenu />} />
            <Route path="/minha-empresa" element={<MyCompany />} />
            <Route path="/menu" element={<MobileMenu />} />
            <Route path="/custos" element={<Navigate to="/accounts-payable" replace />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/accounts/:id" element={<AccountDetailsPage />} />
            <Route path="/accounts-payable" element={<AccountsPayable />} />
            <Route path="/accounts-receivable" element={<AccountsReceivable />} />

            {/* Cadastros Routes */}
            <Route path="/cadastros/produtos" element={<Products />} />
            <Route path="/cadastros/servicos" element={<Services />} />
            <Route path="/cadastros/clientes" element={<Clients />} />
            <Route path="/cadastros/formas-pagamento" element={<div className="text-zinc-900 dark:text-white p-6">Formas de Pagamento (Em breve)</div>} />

            <Route path="/sales" element={<div className="text-zinc-900 dark:text-white p-6">Vendas (Em breve)</div>} />
            <Route path="/schedule" element={<AgendaPage />} />
            <Route path="/financial" element={<FinancialOverview />} />

            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/categories" element={<FinancialCategories />} />
            <Route path="/settings/files" element={<MyFiles />} />

            {/* Tools Routes */}
            <Route path="/tools/dilution-calculator" element={<DilutionCalculator />} />
            <Route path="/tools/product-cost" element={<ProductCostCalculator />} />
            <Route path="/visual-test" element={<VisualTest />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
