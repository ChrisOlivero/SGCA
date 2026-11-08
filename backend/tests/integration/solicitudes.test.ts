
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import "dotenv/config";

const API_URL = "http://localhost:3000";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

test("integración de endpoints de solicitudes", async (t) => {
    const identificador = randomUUID();

    const email = `test-${identificador}@sgca.local`;
    const legajo = `TEST-${identificador.slice(0, 8)}`;

    let estudianteId: number | undefined;

    try {
        // Crear estudiante temporal para las pruebas.
        const resultado = await pool.query(
            `INSERT INTO estudiantes
                (nombre, apellido, email, legajo)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            ["Estudiante", "Prueba", email, legajo]
        );

        estudianteId = resultado.rows[0].id;

        let solicitudId: number | undefined;

        await t.test("POST rechaza datos inválidos", async () => {
            const response = await fetch(`${API_URL}/api/solicitudes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo: "TIPO_INEXISTENTE",
                    estudiante_id: estudianteId
                })
            });

            assert.equal(response.status, 400);
        });

        await t.test("POST rechaza cuerpos superiores a 100 KB", async () => {
            const cuerpoGrande = JSON.stringify({
                descripcion: "A".repeat(101_000),
                tipo: "ALUMNO_REGULAR",
                prioridad: "MEDIA",
                estudiante_id: estudianteId
            });

            const response = await fetch(`${API_URL}/api/solicitudes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: cuerpoGrande
            });

            assert.equal(response.status, 413);

            const datos = await response.json();

            assert.equal(
                datos.mensaje,
                "El cuerpo de la solicitud es demasiado grande"
            );
        });

        await t.test("POST crea una solicitud", async () => {
            const response = await fetch(`${API_URL}/api/solicitudes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    descripcion: "Solicitud generada por prueba automatizada",
                    tipo: "ALUMNO_REGULAR",
                    prioridad: "MEDIA",
                    estudiante_id: estudianteId
                })
            });

            assert.equal(response.status, 201);

            const datos = await response.json();

            assert.ok(datos.id);
            solicitudId = datos.id;
        });

        await t.test("GET obtiene la solicitud creada", async () => {
            assert.ok(solicitudId);

            const response = await fetch(
                `${API_URL}/api/solicitudes/${solicitudId}`
            );

            assert.equal(response.status, 200);

            const datos = await response.json();

            assert.equal(datos.id, solicitudId);
        });

        await t.test("PATCH permite una transición válida", async () => {
            assert.ok(solicitudId);

            const response = await fetch(
                `${API_URL}/api/solicitudes/${solicitudId}/estado`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estado: "EN_REVISION" })
                }
            );

            assert.equal(response.status, 200);

            const datos = await response.json();

            assert.equal(datos.estado, "EN_REVISION");
        });

        await t.test("PATCH rechaza una transición inválida", async () => {
            assert.ok(solicitudId);

            const response = await fetch(
                `${API_URL}/api/solicitudes/${solicitudId}/estado`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estado: "PENDIENTE" })
                }
            );

            assert.equal(response.status, 400);
        });

        await t.test("PATCH controla actualizaciones simultáneas", async () => {
            // Crear una segunda solicitud temporal para esta prueba.
            const creacion = await fetch(`${API_URL}/api/solicitudes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    descripcion: "Solicitud para prueba de concurrencia",
                    tipo: "ALUMNO_REGULAR",
                    prioridad: "MEDIA",
                    estudiante_id: estudianteId
                })
            });

            assert.equal(creacion.status, 201);

            const solicitudConcurrente = await creacion.json();

            assert.ok(solicitudConcurrente.id);

            const url =
                `${API_URL}/api/solicitudes/${solicitudConcurrente.id}/estado`;

            // Ejecutar dos actualizaciones simultáneas.
            const respuestas = await Promise.all([
                fetch(url, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estado: "EN_REVISION" })
                }),
                fetch(url, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estado: "EN_REVISION" })
                })
            ]);

            const estadosHttp = respuestas.map(
                respuesta => respuesta.status
            );

            // Exactamente una operación debe actualizar correctamente.
            assert.equal(
                estadosHttp.filter(estado => estado === 200).length,
                1
            );

            // La otra debe ser rechazada por transición inválida
            // o por conflicto de actualización concurrente.
            assert.equal(
                estadosHttp.filter(
                    estado => estado === 400 || estado === 409
                ).length,
                1
            );

            // Verificar que el estado final sea el esperado.
            const consulta = await fetch(url.replace("/estado", ""));

            assert.equal(consulta.status, 200);

            const solicitudFinal = await consulta.json();

            assert.equal(solicitudFinal.estado, "EN_REVISION");
        });

        await t.test("GET devuelve la lista e incluye la solicitud creada", async () => {
            assert.ok(solicitudId);

            const response = await fetch(`${API_URL}/api/solicitudes`);

            assert.equal(response.status, 200);

            const datos = await response.json();

            assert.ok(Array.isArray(datos));

            const solicitudEncontrada = datos.some(
                (solicitud: { id: number }) => solicitud.id === solicitudId
            );

            assert.equal(
                solicitudEncontrada,
                true,
                "La lista debería incluir la solicitud creada durante la prueba"
            );
        });
        
        await t.test("GET devuelve 404 para una solicitud inexistente", async () => {
            const response = await fetch(
                `${API_URL}/api/solicitudes/2147483647`
            );

            assert.equal(response.status, 404);
        });

    } finally {
        try {
            if (estudianteId !== undefined) {
                try {
                    // Eliminar exclusivamente las solicitudes
                    // pertenecientes al estudiante temporal.
                    await pool.query(
                        "DELETE FROM solicitudes WHERE estudiante_id = $1",
                        [estudianteId]
                    );
                } finally {
                    // Intentar eliminar el estudiante temporal
                    // aunque falle la eliminación anterior.
                    await pool.query(
                        `DELETE FROM estudiantes
                         WHERE id = $1 AND email = $2 AND legajo = $3`,
                        [estudianteId, email, legajo]
                    );
                }
            }
        } finally {
            // Garantizar el cierre del pool.
            await pool.end();
        }
    }
});
