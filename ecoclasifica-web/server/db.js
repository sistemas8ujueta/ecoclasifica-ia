import { createClient } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Por defecto usa el mismo archivo SQLite local que usaba la versión Python
// (database/app.db en la raíz del proyecto), para que los registros
// existentes de usuarios se conserven y sea el mismo archivo que se puede
// inspeccionar directamente.
//
// En producción, DB_URL apunta a una base de datos Turso gratuita
// (libsql://...-tu-org.turso.io) y DB_AUTH_TOKEN trae el token de acceso.
// Con eso los datos sobreviven a cada nuevo despliegue sin necesitar un
// disco/volumen persistente en el servidor.
const RUTA_LOCAL_POR_DEFECTO = path.resolve(__dirname, "../../database/app.db");

export const DB_URL = process.env.DB_URL ?? `file:${RUTA_LOCAL_POR_DEFECTO}`;

if (DB_URL.startsWith("file:")) {
  fs.mkdirSync(path.dirname(DB_URL.slice("file:".length)), { recursive: true });
}

export const db = createClient({
  url: DB_URL,
  authToken: process.env.DB_AUTH_TOKEN,
});

await db.execute("PRAGMA foreign_keys = ON");

await db.execute(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL,
    fecha_registro TEXT NOT NULL
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS clasificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    residuo TEXT NOT NULL,
    confianza REAL NOT NULL,
    caneca TEXT NOT NULL,
    fecha TEXT NOT NULL,
    imagen TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
  )
`);
