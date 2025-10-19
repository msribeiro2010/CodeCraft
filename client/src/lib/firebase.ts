// Firebase desabilitado: projeto usa somente Supabase
export const firebaseConfigured = false;
export const auth = null;
export const googleProvider = null;

export const signInWithGoogle = async () => {
  throw new Error('Firebase está desabilitado neste projeto.');
};