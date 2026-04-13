import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase usando variáveis de ambiente do Vite
// Você deve criar um arquivo .env.local e preencher com seus dados do console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBauG7fwFc6WzIoxluY6o1Ec3hPrrLehvs",
  authDomain: "rg2flix2027.firebaseapp.com",
  projectId: "rg2flix2027",
  storageBucket: "rg2flix2027.firebasestorage.app",
  messagingSenderId: "425288330134",
  appId: "1:425288330134:web:082e4c6ce2e0beb08b0bb7",
  measurementId: "G-M1Z5KBN0QB"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
