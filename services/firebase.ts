// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Config copiado do Firebase Console (Web app)
const firebaseConfig = {
  apiKey: "AIzaSyB1xmsdfr_na3AlK5V4LMAdaS7MK1lAU",
  authDomain: "finandrivepro.firebaseapp.com",
  projectId: "finandrivepro",
  storageBucket: "finandrivepro.firebasestorage.app",
  messagingSenderId: "86863147892",
  appId: "1:86863147892:web:ccb9b482e1086817b63221",
};

// Inicializa app
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Auth (vamos usar login anônimo)
export const auth = getAuth(app);
