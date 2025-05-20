import { queryClient } from "./queryClient";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
  
  return res;
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
