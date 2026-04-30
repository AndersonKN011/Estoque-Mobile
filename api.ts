export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/produtos";

interface Item {
    id?: number;
    nome: string;
    quantidade: number;
    preco: number;
}

export const getEstoque = async () => {
    try {
        const response = await fetch(API_URL);
        return await response.json();
    } catch (error) {
        console.error("Falha na conexão GET:", error);
        return [];
    }
};

export const getValorTotal = async () => {
    try {
        const response = await fetch(API_URL + "/valor-total");
        return await response.json();
    } catch (error) {
        return 0;
    }
};

export const salvarItem = async (item: Item) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
        return await response.json();
    } catch (error) {
        console.error("Falha na conexão POST:", error);
        return null;
    }
};

export const deletarItens = async (ids: number[]) => {
    try {
        const response = await fetch(API_URL + "/deletar-varios", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( ids )
        });
        if (!response.ok) {
            return false;
        }
        return true;
    } catch (error) {
        console.error("Falha na conexão DELETE:", error);
        return null;
    }
};

export const atualizarItem = async (item: Item) => {
    try {
        const response = await fetch(`${API_URL}/${item.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
        return await response.json();
    } catch (error) {
        console.error("Falha na conexão PUT:", error);
        return null;
    }
};