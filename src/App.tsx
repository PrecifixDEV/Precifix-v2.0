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

            <Route path="/services" element={<div className="text-slate-900 dark:text-white p-6">Serviços (Em breve)</div>} />
            <Route path="/sales" element={<div className="text-slate-900 dark:text-white p-6">Vendas (Em breve)</div>} />
            <Route path="/clients" element={<div className="text-slate-900 dark:text-white p-6">Clientes (Em breve)</div>} />
            <Route path="/schedule" element={<div className="text-slate-900 dark:text-white p-6">Agenda (Em breve)</div>} />
            <Route path="/financial" element={<div className="text-slate-900 dark:text-white p-6">Financeiro (Em breve)</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
