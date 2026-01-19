import { useState } from 'react'
import { ErpService } from '../services/erpService'
import { Button } from './ui/button'

export const ErpTester = () => {
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])

    const testInventory = async () => {
        try {
            const res = await ErpService.consultInventory()
            addLog(`Estoque: ${JSON.stringify(res)}`)
        } catch (e: any) {
            addLog(`Erro Estoque: ${e.message}`)
        }
    }

    const testExpense = async () => {
        try {
            addLog("Registrando despesa teste...")
            const res = await ErpService.registerExpense({
                category: 'Teste',
                description: 'Despesa via ERP Service',
                amount: 50.00,
                date: new Date().toISOString()
            })
            addLog(`Despesa criada ID: ${res.id}`)
        } catch (e: any) {
            addLog(`Erro Despesa: ${e.message}`)
        }
    }

    const testNegativeExpense = async () => {
        try {
            addLog("Testando despesa negativa...")
            await ErpService.registerExpense({
                category: 'Teste',
                description: 'Negativa',
                amount: -10,
                date: new Date().toISOString()
            })
        } catch (e: any) {
            addLog(`Sucesso (Erro Capturado): ${e.message}`)
        }
    }

    const testProfit = async () => {
        try {
            const start = new Date()
            start.setDate(1) // 1st of month
            const end = new Date()
            addLog(`Calculando lucro de ${start.toLocaleDateString()} até ${end.toLocaleDateString()}...`)

            const res = await ErpService.calculateProfit(start, end)
            addLog(`Lucro: Receita R$${res.revenue} - Desp R$${res.expenses} = Líq R$${res.netProfit}`)
        } catch (e: any) {
            addLog(`Erro Lucro: ${e.message}`)
        }
    }

    return (
        <div className="p-4 border rounded bg-zinc-100 dark:bg-zinc-900 my-4 text-xs">
            <h3 className="font-bold mb-2">ERP Service Tester (Temporary)</h3>
            <div className="flex gap-2 flex-wrap mb-4">
                <Button onClick={testInventory} variant="outline" size="sm">Estoque</Button>
                <Button onClick={testExpense} variant="outline" size="sm">Add Despesa R$50</Button>
                <Button onClick={testNegativeExpense} variant="outline" size="sm">Add Despesa -R$10</Button>
                <Button onClick={testProfit} variant="outline" size="sm">Calc Lucro Mês</Button>
            </div>
            <div className="bg-zinc-950 text-green-400 p-2 rounded h-32 overflow-y-auto font-mono">
                {logs.length === 0 ? 'Logs aparecerão aqui...' : logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
        </div>
    )
}
