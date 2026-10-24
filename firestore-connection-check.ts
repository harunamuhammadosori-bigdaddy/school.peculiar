import { db } from './firebaseadmin';

async function checkFirestoreConnection() {
  console.log('Checking Firebase Admin access to the (default) Firestore database...');
  const timeoutId = setTimeout(() => {
    console.error('Firestore connection check timed out after 15 seconds.');
    process.exit(1);
  }, 15000);

  try {
    await db.listCollections();
    console.log('Firestore connection successful: (default) database is accessible.');
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'UnknownError';
    console.error(`Firestore connection failed (${reason}). Check the service-account configuration and Firestore IAM permissions.`);
    process.exitCode = 1;
  } finally {
    clearTimeout(timeoutId);
    try {
      await db.terminate();
    } catch {
      process.exitCode = 1;
    }
  }
}

void checkFirestoreConnection();