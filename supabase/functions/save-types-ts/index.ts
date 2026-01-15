import { writeFileStr } from "node:fs/promises";

// Conteúdo do arquivo types.ts gerado
const content = `// types.ts
// Tipos gerados com base no schema público confirmado em 2026-01-15
// Ajuste conforme convenções do seu projeto (p.ex. usar \`string\` para UUIDs).

export type UUID = string;
export type Timestamp = string; // ISO 8601 string
export type DateOnly = string; // 'YYYY-MM-DD'
export type Numeric = string | number; // Postgres numeric can be string in some clients

// -----------------------------
// Table: service_products
// -----------------------------
export interface ServiceProduct {
  id: UUID;
  service_id: UUID;
  product_id: UUID;
  created_at: Timestamp | null;
  user_id: UUID;
}

export interface NewServiceProduct {
  id?: UUID;
  service_id: UUID;
  product_id: UUID;
  created_at?: Timestamp | null;
  user_id: UUID;
}

export interface UpdateServiceProduct {
  service_id?: UUID;
  product_id?: UUID;
  created_at?: Timestamp | null;
  user_id?: UUID;
}

// -----------------------------
// Table: financial_categories
// -----------------------------
export interface FinancialCategory {
  id: UUID;
  user_id: UUID;
  name: string;
  description: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  parent_id: UUID | null;
  scope: string | null;
  is_operational: boolean | null;
}

export interface NewFinancialCategory {
  id?: UUID; // gen_random_uuid()
  user_id: UUID;
  name: string;
  description?: string | null;
  created_at?: Timestamp | null; // now()
  updated_at?: Timestamp | null; // now()
  parent_id?: UUID | null;
  scope?: string | null;
  is_operational?: boolean | null; // default true
}

export interface UpdateFinancialCategory {
  user_id?: UUID;
  name?: string;
  description?: string | null;
  created_at?: Timestamp | null;
  updated_at?: Timestamp | null;
  parent_id?: UUID | null;
  scope?: string | null;
  is_operational?: boolean | null;
}

// -----------------------------
// Table: operational_costs
// -----------------------------
export interface OperationalCost {
  id: UUID;
  user_id: UUID;
  description: string;
  value: Numeric;
  type: string;
  expense_date: DateOnly | null;
  is_recurring: boolean | null;
  recurrence_frequency: string | null;
  recurrence_end_date: DateOnly | null;
  created_at: Timestamp | null;
  recurrence_group_id: UUID | null;
  issue_date: DateOnly | null;
  accrual_date: DateOnly | null;
  due_date: DateOnly | null;
  installment_number: number | null;
  installments_total: number | null;
  status: string | null;
  category: string | null;
  observation: string | null;
}

export interface NewOperationalCost {
  id?: UUID; // gen_random_uuid()
  user_id: UUID;
  description: string;
  value: Numeric;
  type: string;
  expense_date?: DateOnly | null;
  is_recurring?: boolean | null; // default false
  recurrence_frequency?: string | null;
  recurrence_end_date?: DateOnly | null;
  created_at?: Timestamp | null; // now()
  recurrence_group_id?: UUID | null;
  issue_date?: DateOnly | null;
  accrual_date?: DateOnly | null;
  due_date?: DateOnly | null;
  installment_number?: number | null;
  installments_total?: number | null;
  status?: string | null; // default 'open'
  category?: string | null;
  observation?: string | null;
}

export interface UpdateOperationalCost {
  user_id?: UUID;
  description?: string;
  value?: Numeric;
  type?: string;
  expense_date?: DateOnly | null;
  is_recurring?: boolean | null;
  recurrence_frequency?: string | null;
  recurrence_end_date?: DateOnly | null;
  created_at?: Timestamp | null;
  recurrence_group_id?: UUID | null;
  issue_date?: DateOnly | null;
  accrual_date?: DateOnly | null;
  due_date?: DateOnly | null;
  installment_number?: number | null;
  installments_total?: number | null;
  status?: string | null;
  category?: string | null;
  observation?: string | null;
}

// -----------------------------
// Table: expenses
// -----------------------------
export interface Expense {
  id: UUID;
  user_id: UUID;
  title: string;
  category: string | null;
  amount: Numeric;
  date: DateOnly;
  is_paid: boolean | null;
  paid_date: DateOnly | null;
  recurrence: string | null;
  notes: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export interface NewExpense {
  id?: UUID; // gen_random_uuid()
  user_id: UUID;
  title: string;
  category?: string | null;
  amount: Numeric;
  date?: DateOnly; // default CURRENT_DATE
  is_paid?: boolean | null; // default false
  paid_date?: DateOnly | null;
  recurrence?: string | null;
  notes?: string | null;
  created_at?: Timestamp | null; // now()
  updated_at?: Timestamp | null; // now()
}

export interface UpdateExpense {
  user_id?: UUID;
  title?: string;
  category?: string | null;
  amount?: Numeric;
  date?: DateOnly;
  is_paid?: boolean | null;
  paid_date?: DateOnly | null;
  recurrence?: string | null;
  notes?: string | null;
  created_at?: Timestamp | null;
  updated_at?: Timestamp | null;
}

// -----------------------------
// Table: products
// -----------------------------
export interface Product {
  id: UUID;
  user_id: UUID;
  name: string;
  code: string | null;
  description: string | null;
  price: Numeric | null;
  size: string | null;
  dilution: string | null;
  stock_quantity: Numeric | null;
  image_url: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  is_for_sale: boolean | null;
  sale_price: Numeric | null;
  is_dilutable: boolean | null;
  dilution_ratio: string | null;
  container_size_ml: Numeric | null;
}

export interface NewProduct {
  id?: UUID; // gen_random_uuid()
  user_id: UUID;
  name: string;
  code?: string | null;
  description?: string | null;
  price?: Numeric | null; // default 0
  size?: string | null;
  dilution?: string | null;
  stock_quantity?: Numeric | null; // default 0
  image_url?: string | null;
  created_at?: Timestamp | null; // now()
  updated_at?: Timestamp | null; // now()
  is_for_sale?: boolean | null; // default false
  sale_price?: Numeric | null; // default 0
  is_dilutable?: boolean | null; // default false
  dilution_ratio?: string | null;
  container_size_ml?: Numeric | null;
}

export interface UpdateProduct {
  user_id?: UUID;
  name?: string;
  code?: string | null;
  description?: string | null;
  price?: Numeric | null;
  size?: string | null;
  dilution?: string | null;
  stock_quantity?: Numeric | null;
  image_url?: string | null;
  created_at?: Timestamp | null;
  updated_at?: Timestamp | null;
  is_for_sale?: boolean | null;
  sale_price?: Numeric | null;
  is_dilutable?: boolean | null;
  dilution_ratio?: string | null;
  container_size_ml?: Numeric | null;
}
`;

// Escrever em /tmp/types.ts para deploy (não temos acesso ao repo direto aqui)
Deno.writeTextFile('/tmp/types.ts', content).then(() => {
  console.log('types.ts written to /tmp/types.ts');
}).catch((err) => {
  console.error('Failed to write file', err);
});

Deno.serve(async (req: Request) => {
  return new Response(JSON.stringify({ ok: true, path: '/tmp/types.ts' }), { headers: { 'Content-Type': 'application/json' } });
});
