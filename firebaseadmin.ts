import "dotenv/config";
import { resolve } from "node:path";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
	? applicationDefault()
	: cert(resolve(process.cwd(), "service-account.json"));

const app =
getApps().length > 0
? getApps()[0]
: initializeApp({
credential,
projectId: "connectlite-9a32e",
});

export const db = getFirestore(app);