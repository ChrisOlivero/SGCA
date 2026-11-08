
import pool from "../config/database.js";

import type {
    Solicitud,
    EstadoSolicitud
} from "../models/solicitud.js";

import type {
    CrearSolicitudDTO,
    ISolicitudRepository
} from "./solicitud.repository.js";

export class SolicitudRepository implements ISolicitudRepository {

    async crear(datos: CrearSolicitudDTO): Promise<Solicitud> {
        const query = `
            INSERT INTO solicitudes (
                descripcion,
                tipo,
                prioridad,
                estudiante_id
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const values = [
            datos.descripcion ?? null,
            datos.tipo,
            datos.prioridad ?? "MEDIA",
            datos.estudiante_id
        ];

        const result = await pool.query<Solicitud>(query, values);

        const solicitud = result.rows[0];

        if (!solicitud) {
            throw new Error("No se pudo crear la solicitud");
        }

        return solicitud;
    }

    async buscarPorId(id: number): Promise<Solicitud | null> {
        const result = await pool.query<Solicitud>(
            "SELECT * FROM solicitudes WHERE id = $1",
            [id]
        );

        return result.rows[0] ?? null;
    }

    async listar(): Promise<Solicitud[]> {
        const result = await pool.query<Solicitud>(
            "SELECT * FROM solicitudes ORDER BY fecha_creacion DESC"
        );

        return result.rows;
    }

    async actualizarEstado(
        id: number,
        estado: EstadoSolicitud,
        estadoActualEsperado: EstadoSolicitud
    ): Promise<Solicitud | null> {
        const result = await pool.query<Solicitud>(
            `UPDATE solicitudes
             SET estado = $1,
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id = $2
               AND estado = $3
             RETURNING *`,
            [estado, id, estadoActualEsperado]
        );

        return result.rows[0] ?? null;
    }

    async existeEstudiante(id: number): Promise<boolean> {
        const result = await pool.query(
            "SELECT 1 FROM estudiantes WHERE id = $1",
            [id]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }
}
