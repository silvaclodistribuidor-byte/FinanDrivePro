// services/firestoreService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Transaction, Bill } from "../types";

export interface AppPersistedData {
  transactions: Transaction[];
  bills: Bill[];
  categories: string[];
  ownerUid?: string; // quem é o dono desse driver (auth.uid)
}

// Carrega dados do motorista
export async function loadAppData(driverId: string): Promise<AppPersistedData | null> {
  const ref = doc(db, "drivers", driverId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return snap.data() as AppPersistedData;
}

// Salva dados do motorista
export async function saveAppData(
  driverId: string,
  data: Omit<AppPersistedData, "ownerUid">,
  ownerUid: string
): Promise<void> {
  const ref = doc(db, "drivers", driverId);
  await setDoc(
    ref,
    {
      ...data,
      ownerUid,
    },
    { merge: true }
  );
}
