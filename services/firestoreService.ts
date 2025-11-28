// services/firestoreService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Transaction, Bill } from "../types";

export interface AppPersistedData {
  transactions: Transaction[];
  bills: Bill[];
  categories: string[];
}

// Por enquanto um único driver fixo.
// Depois trocamos isso por um ID para cada motorista.
const DRIVER_DOC_ID = "defaultDriver";

export async function loadAppData(): Promise<AppPersistedData | null> {
  const ref = doc(db, "drivers", DRIVER_DOC_ID);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data() as Partial<AppPersistedData>;

  return {
    transactions: data.transactions ?? [],
    bills: data.bills ?? [],
    categories: data.categories ?? []
  };
}

export async function saveAppData(data: AppPersistedData): Promise<void> {
  const ref = doc(db, "drivers", DRIVER_DOC_ID);
  await setDoc(ref, data, { merge: true });
}
