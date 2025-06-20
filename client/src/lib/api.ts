import { queryClient } from "./queryClient";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      // Tenta obter mais informações sobre o erro
      let errorText;
      try {
        errorText = await res.text();
      } catch (textError) {
        errorText = res.statusText;
      }
      
      // Mensagens mais amigáveis para erros comuns
      if (res.status === 500) {
        throw new Error(`Erro no servidor (500). Se continuar, tente novamente mais tarde ou contate o suporte.`);
      } else if (res.status === 401) {
        throw new Error(`Não autenticado. Por favor, faça login novamente.`);
      } else {
        throw new Error(`${res.status}: ${errorText || res.statusText}`);
      }
    }
    
    return res;
  } catch (error) {
    // Erros de rede/conexão
    if (!(error instanceof Error) || !error.message.includes(":")) {
      console.error("API Request error:", error);
      throw new Error(`Erro de conexão com o servidor. Verifique sua conexão de internet.`);
    }
    throw error;
  }
}

export async function updateUserSettings(data: {
  initialBalance?: string | number;
  overdraftLimit?: string | number;
  notificationsEnabled?: boolean;
}) {
  const res = await apiRequest("PATCH", "/api/users/settings", data);
  const json = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/balance"] });
  return json;
}

export async function createTransaction(data: any) {
  const res = await apiRequest("POST", "/api/transactions", data);
  const json = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
  queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
  queryClient.invalidateQueries({ queryKey: ["/api/transactions/upcoming"] });
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/balance"] });
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-summary"] });
  return json;
}

export async function updateTransaction(id: number, data: any) {
  const res = await apiRequest("PATCH", `/api/transactions/${id}`, data);
  const json = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
  queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
  queryClient.invalidateQueries({ queryKey: ["/api/transactions/upcoming"] });
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/balance"] });
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-summary"] });
  return json;
}

export async function deleteTransaction(id: number) {
  const res = await apiRequest("DELETE", `/api/transactions/${id}`);
  const json = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
  queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
  queryClient.invalidateQueries({ queryKey: ["/api/transactions/upcoming"] });
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/balance"] });
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-summary"] });
  return json;
}

export async function deleteAllTransactions() {
  const res = await apiRequest("DELETE", "/api/transactions");
  const json = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
  queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
  queryClient.invalidateQueries({ queryKey: ["/api/transactions/upcoming"] });
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/balance"] });
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-summary"] });
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-summary/last-6-months"] });
  queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
  return json;
}

export async function uploadInvoice(file: File) {
  const formData = new FormData();
  formData.append("invoice", file);

  const res = await fetch("/api/invoices/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }

  const json = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
  return json;
}

export async function createCategory(data: { name: string }) {
  const res = await apiRequest("POST", "/api/categories", data);
  const json = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
  return json;
}
