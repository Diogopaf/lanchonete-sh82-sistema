// Importa as funções necessárias do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Adicione aqui as chaves de configuração do seu projeto Firebase
// COLE AQUI O SEU OBJETO firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyCmsHMyBSOyxXWYk8Z1DD4FqnGvdlyLm0I",
  authDomain: "sh82-sistema.firebaseapp.com",
  projectId: "sh82-sistema",
  storageBucket: "sh82-sistema.firebasestorage.app",
  messagingSenderId: "937690200475",
  appId: "1:937690200475:web:b0a0ccf8ae86650255c93e",
  measurementId: "G-LVZEXD5JB0"
};


// Inicializa o Firebase com as suas chaves
const app = initializeApp(firebaseConfig);

// Exporta a instância do banco de dados (Firestore) para ser usada em outras partes do app
export const db = getFirestore(app);