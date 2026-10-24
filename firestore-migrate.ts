import fs from 'node:fs';
import path from 'node:path';
import { type DocumentData } from 'firebase-admin/firestore';
import { INITIAL_CLASSES } from './src/data/mockData';
import { db } from './firebaseadmin';

const sourcePath = path.resolve(process.cwd(), '.data-store.json');
const collectionNames = [
  'users',
  'students',
  'admissions',
  'results',
  'fees',
  'news',
  'gallery',
  'contactMessages',
  'auditLogs',
] as const;

function isAlreadyExistsError(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false;
  return error.code === 6 || error.code === 'already-exists';
}

async function migrate() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error('The existing .data-store.json file was not found in the project directory.');
  }

  const legacy = JSON.parse(fs.readFileSync(sourcePath, 'utf8')) as Record<string, unknown>;
  const imported: Record<string, number> = {};
  let skipped = 0;

  for (const collectionName of collectionNames) {
    const records = legacy[collectionName];
    if (!Array.isArray(records)) {
      imported[collectionName] = 0;
      continue;
    }

    let collectionImported = 0;
    for (const value of records) {
      if (typeof value !== 'object' || value === null || !('id' in value) || typeof value.id !== 'string') {
        throw new Error(`A record in ${collectionName} is missing a string id.`);
      }

      try {
        await db.collection(collectionName).doc(value.id).create(value as DocumentData);
        collectionImported += 1;
      } catch (error) {
        if (!isAlreadyExistsError(error)) throw error;
        skipped += 1;
      }
    }
    imported[collectionName] = collectionImported;
  }

  for (const schoolClass of INITIAL_CLASSES) {
    try {
      await db.collection('classes').doc(schoolClass.id).create(schoolClass);
      imported.classes = (imported.classes || 0) + 1;
    } catch (error) {
      if (!isAlreadyExistsError(error)) throw error;
      skipped += 1;
    }
  }

  console.log(`Firestore migration completed. Imported ${Object.values(imported).reduce((total, count) => total + count, 0)} records; skipped ${skipped} existing records.`);
  Object.entries(imported).forEach(([collection, count]) => console.log(`${collection}: ${count}`));
}

migrate()
  .catch((error: unknown) => {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error(`Firestore migration failed (${errorName}). The source JSON file was not modified.`);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await db.terminate();
    } catch {
      process.exitCode = 1;
    }
  });