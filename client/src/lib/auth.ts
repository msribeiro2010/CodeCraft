import { queryClient } from "./queryClient";
import { apiRequest } from "./api";
import { type LoginInput, type RegisterInput } from "@shared/schema";
import { auth, signInWithGoogle } from "./firebase";
import { signOut } from "firebase/auth";

// Regular authentication functions
export async function login(data: LoginInput) {
  const res = await apiRequest("POST", "/api/auth/login", data);
  const json = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  return json;
}

export async function register(data: RegisterInput) {
  const res = await apiRequest("POST", "/api/auth/register", data);
  const json = await res.json();
  queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  return json;
}

export async function logout() {
  try {
    // Sign out from Firebase
    if (auth.currentUser) {
      await signOut(auth);
    }
    
    // Sign out from our backend
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
      throw new Error("Failed to fetch user");
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return { isAuthenticated: false };
  }
}

// Firebase authentication helpers
export async function loginWithGoogle() {
  try {
    const result = await signInWithGoogle();
    
    // After Firebase auth, we need to ensure our backend has a session
    // We don't need to manually refresh here as our auth provider will do this automatically
    // when it detects a Firebase auth state change
    
    return result;
  } catch (error) {
    console.error("Error during Google login:", error);
    throw error;
  }
}
