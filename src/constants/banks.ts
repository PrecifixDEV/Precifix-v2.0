export interface Bank {
    code: string;
    name: string;
    color: string;
    shortName?: string;
}

export const BRAZILIAN_BANKS: Bank[] = [
    { code: '001', name: 'Banco do Brasil', shortName: 'BB', color: '#F8D117' },
    { code: '237', name: 'Bradesco', color: '#CC092F' },
    { code: '341', name: 'Itaú', color: '#EC7000' },
    { code: '104', name: 'Caixa Econômica Federal', shortName: 'Caixa', color: '#005CA9' },
    { code: '033', name: 'Santander', color: '#EC0000' },
    { code: '260', name: 'Nu Pagamentos', shortName: 'Nubank', color: '#820AD1' },
    { code: '077', name: 'Banco Inter', shortName: 'Inter', color: '#FF7A00' },
    { code: '336', name: 'Banco C6', shortName: 'C6 Bank', color: '#242424' },
    { code: '212', name: 'Banco Original', shortName: 'Original', color: '#31C450' },
    { code: '655', name: 'Banco Votorantim', shortName: 'Neon', color: '#00FFFF' }, // Neon uses BV
    { code: '208', name: 'BTG Pactual', shortName: 'BTG', color: '#00305E' },
    { code: '422', name: 'Banco Safra', shortName: 'Safra', color: '#CFA453' },
    { code: '756', name: 'Sicoob', color: '#003641' },
    { code: '748', name: 'Sicredi', color: '#366F31' },
    { code: '623', name: 'Banco Pan', shortName: 'Pan', color: '#0083CA' },
    { code: '290', name: 'PagSeguro', shortName: 'PagBank', color: '#00C752' }, // Extra popular one
    { code: '380', name: 'PicPay', color: '#11C76F' }, // Extra popular one
    { code: '323', name: 'Mercado Pago', color: '#009EE3' },
    { code: 'NEXT', name: 'Next', color: '#00FF5F' },
    { code: '637', name: 'Banco Sofisa', shortName: 'Sofisa', color: '#E9530E' },
    { code: 'OTHER', name: 'Outros', color: '#64748b' },
    { code: '999', name: 'Caixa Físico', shortName: 'Dinheiro', color: '#16a34a' }, // Custom for cash
];

// Helper to find bank by code
export const getBankByCode = (code: string) => {
    return BRAZILIAN_BANKS.find(b => b.code === code);
};
