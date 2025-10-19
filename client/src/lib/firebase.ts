// Firebase desabilitado: projeto usa somente Supabase
// Este stub evita erros de runtime quando algum código tenta acessar métodos do Firebase.

export const firebaseConfigured = false;

// Fornece um stub seguro com métodos no-op para evitar TypeError
export const auth = {
  // Retorna uma função de unsubscriber no-op
  onAuthStateChanged: (_cb: any) => {
    // Firebase está desabilitado; não há usuário para observar
    return () => {};
  },
  // Métodos comuns que podem ser referenciados acidentalmente
  signInWithCustomToken: async (_token: string) => {
    throw new Error('Firebase está desabilitado neste projeto.');
  },
  signOut: async () => {
    return;
  },
  currentUser: null,
};

export const googleProvider = null;

export const signInWithGoogle = async () => {
  throw new Error('Firebase está desabilitado neste projeto.');
};