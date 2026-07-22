/**
 * Migration 002 — Add extra user columns (PostgreSQL).
 *
 * Adds apellido, codigo_postal, sexo, telefono, password_hash, role
 * to the users table. Uses a PL/pgSQL anonymous block for idempotent
 * column addition (IF NOT EXISTS check via information_schema).
 */

export const name = '002-add-user-fields';

/**
 * Apply the migration.
 *
 * @param runSql — Async function to execute a SQL string (with optional params)
 */
export async function up(
  runSql: (sql: string, params?: unknown[]) => Promise<void>,
): Promise<void> {
  // Add each column idempotently using DO $$ … END $$ blocks
  const columns: Array<{ name: string; definition: string }> = [
    { name: 'apellido', definition: "TEXT DEFAULT ''" },
    { name: 'codigo_postal', definition: "TEXT DEFAULT ''" },
    { name: 'sexo', definition: "TEXT DEFAULT ''" },
    { name: 'telefono', definition: "TEXT DEFAULT ''" },
    { name: 'password_hash', definition: "TEXT DEFAULT ''" },
    { name: 'role', definition: "VARCHAR(20) NOT NULL DEFAULT 'user'" },
  ];

  for (const col of columns) {
    const sql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = '${col.name}'
        ) THEN
          ALTER TABLE users ADD COLUMN ${col.name} ${col.definition};
        END IF;
      END
      $$;
    `;
    await runSql(sql);
  }

  console.log('[migration:002] Added user columns (if missing).');
}
