
import "dotenv/config";
import { Pool } from "pg";

const variablesRequeridas = [
    "DB_HOST",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD"
] as const;

const variablesFaltantes = variablesRequeridas.filter(
    (variable) => !process.env[variable]?.trim()
);

if (variablesFaltantes.length > 0) {
    throw new Error(
        `Faltan variables de entorno para la conexión a PostgreSQL: ${variablesFaltantes.join(", ")}`
    );
}

const puerto = Number(process.env.DB_PORT ?? 5432);

if (!Number.isInteger(puerto) || puerto <= 0 || puerto > 65535) {
    throw new Error("La variable DB_PORT debe contener un puerto válido.");
}

const pool = new Pool({
    host: process.env.DB_HOST,
    port: puerto,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

export default pool;
