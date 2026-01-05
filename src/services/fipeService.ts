export interface FipeBrand {
    codigo: string;
    nome: string;
}

export interface FipeModel {
    codigo: string;
    nome: string;
}

export interface FipeYear {
    codigo: string;
    nome: string;
}

export interface FipeVehicle {
    TipoVeiculo: number;
    Valor: string;
    Marca: string;
    Modelo: string;
    AnoModelo: number;
    Combustivel: string;
    CodigoFipe: string;
    MesReferencia: string;
    SiglaCombustivel: string;
}

export type VehicleType = 'carros' | 'motos' | 'caminhoes';

const BASE_URL = 'https://parallelum.com.br/fipe/api/v1';

export const fipeService = {
    async getBrands(type: VehicleType): Promise<FipeBrand[]> {
        const response = await fetch(`${BASE_URL}/${type}/marcas`);
        if (!response.ok) throw new Error('Falha ao buscar marcas');
        return response.json();
    },

    async getModels(type: VehicleType, brandId: string): Promise<FipeModel[]> {
        const response = await fetch(`${BASE_URL}/${type}/marcas/${brandId}/modelos`);
        if (!response.ok) throw new Error('Falha ao buscar modelos');
        const data = await response.json();
        return data.modelos || [];
    },

    async getYears(type: VehicleType, brandId: string, modelId: string): Promise<FipeYear[]> {
        const response = await fetch(`${BASE_URL}/${type}/marcas/${brandId}/modelos/${modelId}/anos`);
        if (!response.ok) throw new Error('Falha ao buscar anos');
        return response.json();
    },

    async getVehicleDetails(type: VehicleType, brandId: string, modelId: string, yearId: string): Promise<FipeVehicle> {
        const response = await fetch(`${BASE_URL}/${type}/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`);
        if (!response.ok) throw new Error('Falha ao buscar detalhes do veículo');
        return response.json();
    }
};
