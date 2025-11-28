import {
  collection,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { Transaction } from "../types";

// Por enquanto um ID fixo de motorista para testes.
// Depois trocamos para um código digitado pelo motorista.
const DRIVER_ID = "default-driver";

const driversCollection = collection(db, "drivers");

interface DriverData {
  transactions: Transaction[];
}

// Carrega dados do motorista (lista de transações)
export async function loadDriverData(): Promise<DriverData | null> {
  try {
    const driverDocRef = doc(driversCollection, DRIVER_ID);
    const snap = await getDoc(driverDocRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data() as DriverData;
    return {
      transactions: data.transactions || []
    };
  } catch (error) {
    console.error("Erro ao carregar dados do Firestore:", error);
    return null;
  }
}

// Salva as transações do motorista
export async function saveTransactions(
  transactions: Transaction[]
): Promise<void> {
  try {
    const driverDocRef = doc(driversCollection, DRIVER_ID);
    const payload: DriverData = {
      transactions
    };
    await setDoc(driverDocRef, payload, { merge: true });
  } catch (error) {
    console.error("Erro ao salvar transações no Firestore:", error);
  }
}
