/**
 * PostgreSQL migrations entry point.
 *
 * Imports individual migration modules and runs them via the shared
 * migrations-runner. This module is lazy-imported by db.ts only in
 * PostgreSQL mode, so the pg dependency is never loaded for SQLite.
 */

import { runMigrations as runViaRunner } from './migrations-runner.js';
import * as m001 from './migrations/001-initial-schema.js';
import * as m002 from './migrations/002-add-user-fields.js';

/**
 * Run all pending PostgreSQL migrations in order.
 */
export async function runMigrations(): Promise<void> {
  console.log('[migrate] Running PostgreSQL migrations…');
  await runViaRunner([m001, m002]);
}
