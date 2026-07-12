// Firestore data access for public landing-page leads.
// Collection: leads/{leadId}  (consultation / package requests from prospects)

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function createLead({
  name,
  email,
  website = "",
  plan = "free-consult",
  message = "",
}) {
  if (!db) {
    throw new Error("Lead capture is unavailable: Firebase is not configured.");
  }

  const leadsRef = collection(db, "leads");
  const docRef = await addDoc(leadsRef, {
    name: name || "",
    email: email || "",
    website: website || "",
    plan,
    message: message || "",
    status: "new",
    source: "landing",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
