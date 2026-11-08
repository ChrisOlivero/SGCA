
import type { EstadoSolicitud } from "../models/solicitud.js";

export class TransicionEstadoInvalidaError extends Error {
    constructor(estadoActual: EstadoSolicitud, nuevoEstado: EstadoSolicitud) {
        super(
            `No se puede cambiar de ${estadoActual} a ${nuevoEstado}`
        );

        this.name = "TransicionEstadoInvalidaError";
    }
}

const estadosPermitidos: Record<
    EstadoSolicitud,
    EstadoSolicitud[]
> = {
    PENDIENTE: ["EN_REVISION", "RECHAZADA"],
    EN_REVISION: ["APROBADA", "RECHAZADA"],
    APROBADA: ["FINALIZADA"],
    RECHAZADA: [],
    FINALIZADA: []
};

export function validarTransicionEstado(
    estadoActual: EstadoSolicitud,
    nuevoEstado: EstadoSolicitud
): void {
    const permitidos = estadosPermitidos[estadoActual];

    if (!permitidos.includes(nuevoEstado)) {
        throw new TransicionEstadoInvalidaError(
            estadoActual,
            nuevoEstado
        );
    }
}
