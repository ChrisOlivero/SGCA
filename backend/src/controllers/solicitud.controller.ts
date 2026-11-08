
import type {
    IncomingMessage,
    ServerResponse
} from "node:http";

import { z } from "zod";
import { SolicitudService } from "../services/solicitud.service.js";
import type { CrearSolicitudDTO } from "../repositories/solicitud.repository.js";
import { leerBodyJson } from "../utils/http-body.js";

const crearSolicitudSchema = z.object({
    descripcion: z.string().max(500).optional(),
    tipo: z.enum(["ALUMNO_REGULAR", "ANALITICO_PARCIAL"]),
    prioridad: z.enum(["BAJA", "MEDIA", "ALTA"]).optional(),
    estudiante_id: z.number().int().positive()
});

const actualizarEstadoSchema = z.object({
    estado: z.enum([
        "PENDIENTE",
        "EN_REVISION",
        "APROBADA",
        "RECHAZADA",
        "FINALIZADA"
    ])
});

export class SolicitudController {
    constructor(
        private readonly solicitudService: SolicitudService
    ) {}

    private responder(
        response: ServerResponse,
        status: number,
        data: unknown
    ): void {
        response.writeHead(status, {
            "Content-Type": "application/json; charset=utf-8"
        });

        response.end(JSON.stringify(data));
    }
    
    async listar(response: ServerResponse): Promise<void> {
        try {
            const solicitudes = await this.solicitudService.listar();

            this.responder(response, 200, solicitudes);
        } catch (error) {
            console.error(error);

            this.responder(response, 500, {
                mensaje: "Error al consultar las solicitudes"
            });
        }
    }

    async buscarPorId(
        response: ServerResponse,
        id: number
    ): Promise<void> {
        try {
            const solicitud = await this.solicitudService.buscarPorId(id);

            if (!solicitud) {
                this.responder(response, 404, {
                    mensaje: "Solicitud no encontrada"
                });
                return;
            }

            this.responder(response, 200, solicitud);
        } catch (error) {
            console.error(error);

            this.responder(response, 500, {
                mensaje: "Error al consultar la solicitud"
            });
        }
    }

    async crear(
        request: IncomingMessage,
        response: ServerResponse
    ): Promise<void> {
        try {
            const body = await leerBodyJson(request);
            const validacion = crearSolicitudSchema.safeParse(body);

            if (!validacion.success) {
                this.responder(response, 400, {
                    mensaje: "Datos inválidos",
                    errores: validacion.error.issues
                });
                return;
            }

            const datos: CrearSolicitudDTO = {
                tipo: validacion.data.tipo,
                estudiante_id: validacion.data.estudiante_id,
                ...(validacion.data.descripcion !== undefined
                    ? { descripcion: validacion.data.descripcion }
                    : {}),
                ...(validacion.data.prioridad !== undefined
                    ? { prioridad: validacion.data.prioridad }
                    : {})
            };

            const solicitud = await this.solicitudService.crear(datos);

            this.responder(response, 201, solicitud);
        } catch (error) {
            console.error(error);

            if (error instanceof SyntaxError) {
                this.responder(response, 400, {
                    mensaje: "El cuerpo JSON no es válido"
                });
                return;
            }

            if (error instanceof Error &&
                error.message === "El estudiante no existe") {
                this.responder(response, 404, {
                    mensaje: error.message
                });
                return;
            }

            this.responder(response, 500, {
                mensaje: "Error al crear la solicitud"
            });
        }
    }

    async actualizarEstado(
        request: IncomingMessage,
        response: ServerResponse,
        id: number
    ): Promise<void> {
        try {
            const body = await leerBodyJson(request);
            const validacion = actualizarEstadoSchema.safeParse(body);

            if (!validacion.success) {
                this.responder(response, 400, {
                    mensaje: "Estado inválido",
                    errores: validacion.error.issues
                });
                return;
            }

            const solicitud = await this.solicitudService.actualizarEstado(
                id,
                validacion.data.estado
            );

            if (!solicitud) {
                this.responder(response, 404, {
                    mensaje: "Solicitud no encontrada"
                });
                return;
            }

            this.responder(response, 200, solicitud);
        } catch (error) {
            console.error(error);

            this.responder(response, 400, {
                mensaje: error instanceof Error
                    ? error.message
                    : "No se pudo actualizar el estado"
            });
        }
    }
}
