import { queryClient } from "./queryClient";
import { apiRequest } from "./api";
import { type LoginInput, type RegisterInput } from "@shared/schema";

// Regular authentication functions
export async function login(data: LoginInput) {
  try {
    const res = await apiRequest("POST", "/api/auth/login", data);
    const json = await res.json();
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    return json;
  } catch (error) {
    console.error("Login error:", error);
    // Mostrar mais detalhes sobre o erro para facilitar depuração
    if (error instanceof Error) {
      throw new Error(`Login error: ${error.message}`);
    }
    throw error;
  }
}

export async function register(data: RegisterInput) {
  const res = await apiRequest("POST", "/api/auth/register", data);
  const json = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  return json;
}

export async function logout() {
  try {
    // Sign out only from our backend (Supabase/Express)
    const res = await apiRequest("GET", "/api/auth/logout");
    const json = await res.json();
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    return json;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const res = await fetch("/api/auth/user", {
      method: "GET",
      credentials: "include",
    });
    
    if (!res.ok) {
      console.warn("Auth check failed:", res.status);
      return { isAuthenticated: false };
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return { isAuthenticated: false };
  }
}
