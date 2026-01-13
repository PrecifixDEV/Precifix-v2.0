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
import ManageCosts from './pages/ManageCosts';
import AccountsPage from "./pages/financial/AccountsPage";
import AccountDetailsPage from "./pages/financial/AccountDetailsPage";
import AccountsPayable from './pages/AccountsPayable'
import { MyCompany } from './pages/MyCompany'
import { Products } from './pages/cadastros/Products'
import { Services } from './pages/cadastros/Services'
import { Clients } from './pages/cadastros/Clients'
import { FinancialOverview } from './pages/FinancialOverview'
import { DilutionCalculator } from './pages/tools/DilutionCalculator'
import { ProductCostCalculator } from './pages/tools/ProductCostCalculator'
import FinancialCategories from './pages/settings/FinancialCategories';


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
            <Route path="/minha-empresa" element={<MyCompany />} />
            <Route path="/custos" element={<ManageCosts />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/accounts/:id" element={<AccountDetailsPage />} />
            <Route path="/accounts-payable" element={<AccountsPayable />} />

            {/* Cadastros Routes */}
            <Route path="/cadastros/produtos" element={<Products />} />
            <Route path="/cadastros/servicos" element={<Services />} />
            <Route path="/cadastros/clientes" element={<Clients />} />
            <Route path="/cadastros/formas-pagamento" element={<div className="text-slate-900 dark:text-white p-6">Formas de Pagamento (Em breve)</div>} />

            <Route path="/sales" element={<div className="text-slate-900 dark:text-white p-6">Vendas (Em breve)</div>} />
            <Route path="/schedule" element={<div className="text-slate-900 dark:text-white p-6">Agenda (Em breve)</div>} />
            <Route path="/financial" element={<FinancialOverview />} />

            <Route path="/settings/categories" element={<FinancialCategories />} />

            {/* Tools Routes */}
            <Route path="/tools/dilution-calculator" element={<DilutionCalculator />} />
            <Route path="/tools/product-cost" element={<ProductCostCalculator />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
