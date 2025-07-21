import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Check if Firebase environment variables are configured
const isFirebaseConfigured = () => {
  return !!
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID;
};

export const firebaseConfigured = isFirebaseConfigured();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project'}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project'}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

// Initialize Firebase only if properly configured
let app: any = null;
let auth: any = null;
let googleProvider: any = null;

if (firebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export { auth, googleProvider };

// Function to sign in with Google
export const signInWithGoogle = async () => {
  if (!firebaseConfigured) {
    throw new Error('Firebase não está configurado. Configure as variáveis de ambiente do Firebase.');
  }
  
  if (!auth || !googleProvider) {
    throw new Error('Firebase não foi inicializado corretamente.');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};