// Importa as funções necessárias do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// As chaves agora são lidas das variáveis de ambiente (.env)
// import.meta.env é como o Vite nos dá acesso a elas.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREASS_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};


// Inicializa o Firebase com as suas chaves
const app = initializeApp(firebaseConfig);

// Exporta a instância do banco de dados (Firestore) para ser usada em outras partes do app
export const db = getFirestore(app);