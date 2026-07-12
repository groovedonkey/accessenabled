// Firestore data access for audits.
// Collection: audits/{auditId}  (each audit is owned by a single auditor uid)

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./firebase";
import { blankResults } from "./checklist";

const auditsRef = collection(db, "audits");

export async function createAudit(uid, { url, client = "", notes = "" }) {
  const docRef = await addDoc(auditsRef, {
    ownerUid: uid,
    url: url || "",
    client,
    notes,
    type: "website",
    status: "draft",
    results: blankResults(),
    scanMeta: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAudit(id) {
  const snap = await getDoc(doc(db, "audits", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listAudits(uid) {
  const q = query(
    auditsRef,
    where("ownerUid", "==", uid),
    orderBy("updatedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveAudit(id, patch) {
  await updateDoc(doc(db, "audits", id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function removeAudit(id) {
  await deleteDoc(doc(db, "audits", id));
}

// Invokes the Puppeteer + axe-core Cloud Function.
// Whole-site scans crawl up to 10 pages, so allow the full server timeout.
const scanUrlCallable = httpsCallable(functions, "scanUrl", {
  timeout: 300000,
});

export async function runScan(url, scope = "page", maxPages = 10) {
  const res = await scanUrlCallable({ url, scope, maxPages });
  return res.data;
}
