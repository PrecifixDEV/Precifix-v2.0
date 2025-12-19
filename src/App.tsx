import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState<string>('Verificando conexão...')

  useEffect(() => {
    // Simple check to see if client is initialized
    if (supabase) {
      setStatus('Supabase Client Inicializado')
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-700">
        <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Precifix v2.0
        </h1>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg">
            <span className="text-slate-300">Stack</span>
            <span className="font-semibold text-white">Vite + React + TS</span>
          </div>

          <div className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg">
            <span className="text-slate-300">Estilização</span>
            <span className="font-semibold text-cyan-400">Tailwind CSS</span>
          </div>

          <div className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg">
            <span className="text-slate-300">Banco de Dados</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status.includes('Inicializado') ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="font-semibold text-emerald-400">{status}</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-slate-500 text-sm">
          Ambiente pronto para desenvolvimento.
        </p>
      </div>
    </div>
  )
}

export default App
