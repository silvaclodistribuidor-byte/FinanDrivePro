import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// COPIE aqui o firebaseConfig que o Firebase te mostrou
// na tela "Adicionar o Firebase ao seu app da Web".
const firebaseConfig = {
  apiKey: "AIzaSyB1xmsdfr_na3A1K5XV4lMAdaS7M7kl1AU",
  authDomain: "finandrivepro.firebaseapp.com",
  projectId: "finandrivepro",
  storageBucket: "finandrivepro.firebasestorage.app",
  messagingSenderId: "86863147892",
  appId: "1:86863147892:web:ccb9b482c1086817b63221"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Exporta a instância do Firestore para usar no resto do app
export const db = getFirestore(app);
