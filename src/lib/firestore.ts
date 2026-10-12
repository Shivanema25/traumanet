import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { Hospital, EmergencySession, BillAudit } from "@/types";
import { MOCK_HOSPITALS, MOCK_ACTIVE_SESSION, MOCK_BILL_AUDITS } from "@/data/mockData";

// In-Memory Fallback State (Deterministic Local Cache)
let memoryHospitals: Hospital[] = [...MOCK_HOSPITALS];
let memorySessions: Record<string, EmergencySession> = {
  [MOCK_ACTIVE_SESSION.id]: { ...MOCK_ACTIVE_SESSION },
};
let memoryAudits: BillAudit[] = [...MOCK_BILL_AUDITS];

// Subscribers for in-memory events
const sessionSubscribers: Record<string, Set<(session: EmergencySession | null) => void>> = {};
const hospitalSubscribers = new Set<(hospitals: Hospital[]) => void>();

function notifyHospitalSubscribers() {
  hospitalSubscribers.forEach((cb) => {
    try {
      cb([...memoryHospitals]);
    } catch (e) {
      console.error("Error in hospital subscriber callback:", e);
    }
  });
}

function notifySessionSubscribers(id: string) {
  const session = memorySessions[id] || null;
  const subs = sessionSubscribers[id];
  if (subs) {
    subs.forEach((cb) => {
      try {
        cb(session ? { ...session } : null);
      } catch (e) {
        console.error("Error in session subscriber callback:", e);
      }
    });
  }
}

// 1. HOSPITALS
export async function getHospitals(): Promise<Hospital[]> {
  if (db && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Mock")) {
    try {
      const snap = await getDocs(collection(db, "hospitals"));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Hospital));
      }
    } catch (err) {
      console.warn("Firestore getHospitals failed, falling back to local memory:", err);
    }
  }
  return [...memoryHospitals];
}

export function subscribeHospitals(callback: (hospitals: Hospital[]) => void): Unsubscribe {
  if (db && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Mock")) {
    try {
      return onSnapshot(
        collection(db, "hospitals"),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Hospital));
            callback(list);
          } else {
            callback([...memoryHospitals]);
          }
        },
        (error) => {
          console.warn("Firestore subscribeHospitals error, using fallback:", error);
          callback([...memoryHospitals]);
        }
      );
    } catch {
      // Fallback below
    }
  }

  // Fallback in-memory
  hospitalSubscribers.add(callback);
  callback([...memoryHospitals]);

  return () => {
    hospitalSubscribers.delete(callback);
  };
}

export async function updateHospital(id: string, updates: Partial<Hospital>): Promise<void> {
  const idx = memoryHospitals.findIndex((h) => h.id === id);
  if (idx !== -1) {
    memoryHospitals[idx] = { ...memoryHospitals[idx], ...updates };
    notifyHospitalSubscribers();
  }

  if (db && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Mock")) {
    try {
      const ref = doc(db, "hospitals", id);
      await updateDoc(ref, updates as any);
    } catch (err) {
      console.warn("Firestore updateHospital failed:", err);
    }
  }
}

// 2. EMERGENCY SESSIONS
export async function getEmergencySession(id: string): Promise<EmergencySession | null> {
  if (db && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Mock")) {
    try {
      const ref = doc(db, "emergency_sessions", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as EmergencySession;
      }
    } catch (err) {
      console.warn("Firestore getEmergencySession failed:", err);
    }
  }
  return memorySessions[id] ? { ...memorySessions[id] } : null;
}

export async function createEmergencySession(
  session: Omit<EmergencySession, "id"> & { id?: string }
): Promise<EmergencySession> {
  const newId = session.id || `session-ngp-${Date.now().toString().slice(-4)}`;
  const fullSession: EmergencySession = {
    ...session,
    id: newId,
    createdAt: session.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memorySessions[newId] = fullSession;
  notifySessionSubscribers(newId);

  if (db && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Mock")) {
    try {
      const ref = doc(db, "emergency_sessions", newId);
      await setDoc(ref, fullSession);
    } catch (err) {
      console.warn("Firestore createEmergencySession failed:", err);
    }
  }

  return fullSession;
}

export async function updateEmergencySession(
  id: string,
  updates: Partial<EmergencySession>
): Promise<void> {
  if (memorySessions[id]) {
    memorySessions[id] = {
      ...memorySessions[id],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    notifySessionSubscribers(id);
  }

  if (db && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Mock")) {
    try {
      const ref = doc(db, "emergency_sessions", id);
      await updateDoc(ref, {
        ...updates,
        updatedAt: new Date().toISOString(),
      } as any);
    } catch (err) {
      console.warn("Firestore updateEmergencySession failed:", err);
    }
  }
}

export function subscribeEmergencySession(
  id: string,
  callback: (session: EmergencySession | null) => void
): Unsubscribe {
  if (db && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Mock")) {
    try {
      return onSnapshot(
        doc(db, "emergency_sessions", id),
        (snap) => {
          if (snap.exists()) {
            callback({ id: snap.id, ...snap.data() } as EmergencySession);
          } else {
            callback(memorySessions[id] ? { ...memorySessions[id] } : null);
          }
        },
        (error) => {
          console.warn("Firestore subscribeEmergencySession error, fallback:", error);
          callback(memorySessions[id] ? { ...memorySessions[id] } : null);
        }
      );
    } catch {
      // Fallback below
    }
  }

  if (!sessionSubscribers[id]) {
    sessionSubscribers[id] = new Set();
  }
  sessionSubscribers[id].add(callback);
  callback(memorySessions[id] ? { ...memorySessions[id] } : null);

  return () => {
    sessionSubscribers[id]?.delete(callback);
  };
}

// 3. BILL AUDITS
export async function getBillAudits(): Promise<BillAudit[]> {
  if (db && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Mock")) {
    try {
      const snap = await getDocs(collection(db, "bill_audits"));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BillAudit));
      }
    } catch (err) {
      console.warn("Firestore getBillAudits failed:", err);
    }
  }
  return [...memoryAudits];
}

export async function createBillAudit(audit: Omit<BillAudit, "id">): Promise<BillAudit> {
  const newId = `audit-cghs-${Date.now().toString().slice(-4)}`;
  const fullAudit: BillAudit = { ...audit, id: newId };
  memoryAudits.unshift(fullAudit);

  if (db && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Mock")) {
    try {
      const ref = doc(db, "bill_audits", newId);
      await setDoc(ref, fullAudit);
    } catch (err) {
      console.warn("Firestore createBillAudit failed:", err);
    }
  }

  return fullAudit;
}

// Helper to reset memory state for testing/demo
export function resetDemoState(): void {
  memoryHospitals = [...MOCK_HOSPITALS];
  memorySessions = {
    [MOCK_ACTIVE_SESSION.id]: { ...MOCK_ACTIVE_SESSION },
  };
  memoryAudits = [...MOCK_BILL_AUDITS];
  notifyHospitalSubscribers();
  notifySessionSubscribers(MOCK_ACTIVE_SESSION.id);
}
