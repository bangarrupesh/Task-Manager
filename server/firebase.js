import admin from "firebase-admin";
import fs from "fs";

let firebaseAdminApp = null;

try {
  const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (serviceAccountVar) {
    let serviceAccount;
    try {
      // Try parsing as JSON string directly
      serviceAccount = JSON.parse(serviceAccountVar);
    } catch {
      // Otherwise, parse as a file path
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountVar, "utf8"));
    }
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin successfully initialized with Service Account Credentials.");
  } else if (projectId && projectId !== "YOUR_FIREBASE_PROJECT_ID") {
    // If only Project ID is available, initialize using it
    firebaseAdminApp = admin.initializeApp({
      projectId: projectId
    });
    console.log(`Firebase Admin successfully initialized with Project ID: ${projectId}`);
  } else {
    console.warn("WARNING: Firebase env variables (FIREBASE_PROJECT_ID / FIREBASE_SERVICE_ACCOUNT_KEY) not set or default. Firebase Auth validation may fail.");
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error.message);
}

export const verifyFirebaseToken = async (token) => {
  if (!firebaseAdminApp) {
    throw new Error("Firebase Admin SDK is not initialized. Please configure FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_KEY in server/.env");
  }
  return await admin.auth().verifyIdToken(token);
};

export default admin;
