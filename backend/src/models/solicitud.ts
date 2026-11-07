
import type { Estudiante } from "./estudiante.js";
import type { Responsable } from "./responsable.js";

export type TipoCertificado =
    | "ALUMNO_REGULAR"
    | "ANALITICO_PARCIAL";

export type EstadoSolicitud =
    | "PENDIENTE"
    | "EN_REVISION"
    | "APROBADA"
    | "RECHAZADA"
    | "FINALIZADA";

export type Prioridad =
    | "BAJA"
    | "MEDIA"
    | "ALTA";

export interface Solicitud {
    id: number;
    descripcion: string | null;
    tipo: TipoCertificado;
    estado: EstadoSolicitud;
    prioridad: Prioridad;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
    estudiante_id: number;
    responsable_id: number | null;
}

export interface SolicitudDetalle extends Solicitud {
    estudiante?: Estudiante;
    responsable?: Responsable;
}
