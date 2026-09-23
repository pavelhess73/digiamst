import { neon } from '@neondatabase/serverless';

let sqlClient = null;
let tableChecked = false;

/**
 * Získá instanci klienta pro Neon Serverless PostgreSQL
 */
export function getDb() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL není nastavena. Zadejte connection string z Neon.tech do Vercel Environment Variables.');
  }

  if (!sqlClient) {
    sqlClient = neon(connectionString);
  }
  return sqlClient;
}

/**
 * Automaticky zajistí existenci tabulky applications v Neon DB
 */
export async function ensureTable() {
  if (tableChecked) return;
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      id VARCHAR(64) PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      student_name VARCHAR(255) NOT NULL,
      student_class VARCHAR(50) NOT NULL,
      parent_email VARCHAR(255) NOT NULL,
      parent_phone VARCHAR(50) DEFAULT '',
      motivation TEXT DEFAULT '',
      status VARCHAR(50) NOT NULL DEFAULT 'Nová',
      notes TEXT DEFAULT ''
    );
  `;
  tableChecked = true;
}

/**
 * Převede řádek z PostgreSQL (snake_case) do camelCase objektu pro frontend
 */
export function formatRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    studentName: row.student_name,
    studentClass: row.student_class,
    parentEmail: row.parent_email,
    parentPhone: row.parent_phone || '',
    motivation: row.motivation || '',
    status: row.status || 'Nová',
    notes: row.notes || ''
  };
}

/**
 * Nastavení standardních CORS hlaviček
 */
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
