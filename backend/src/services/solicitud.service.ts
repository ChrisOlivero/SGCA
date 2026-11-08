
import type {
    Solicitud,
    EstadoSolicitud
} from "../models/solicitud.js";

import type {
    CrearSolicitudDTO,
    ISolicitudRepository
} from "../repositories/solicitud.repository.js";

import { validarTransicionEstado } from "../domain/transiciones-solicitud.js";

export class EstudianteNoExisteError extends Error {
    constructor() {
        super("El estudiante no existe");
        this.name = "EstudianteNoExisteError";
    }
}

export class ConflictoActualizacionEstadoError extends Error {
    constructor() {
        super("La solicitud fue modificada por otra operación. Consulte su estado actual e intente nuevamente.");
        this.name = "ConflictoActualizacionEstadoError";
    }
}

export class SolicitudService {
    constructor(
        private readonly solicitudRepository: ISolicitudRepository
    ) {}

    async crear(datos: CrearSolicitudDTO): Promise<Solicitud> {
        const estudianteExiste =
            await this.solicitudRepository.existeEstudiante(
                datos.estudiante_id
            );

        if (!estudianteExiste) {
            throw new EstudianteNoExisteError();
        }

        return this.solicitudRepository.crear(datos);
    }

    async buscarPorId(id: number): Promise<Solicitud | null> {
        return this.solicitudRepository.buscarPorId(id);
    }

    async listar(): Promise<Solicitud[]> {
        return this.solicitudRepository.listar();
    }

    async actualizarEstado(
        id: number,
        nuevoEstado: EstadoSolicitud
    ): Promise<Solicitud | null> {
        const solicitud =
            await this.solicitudRepository.buscarPorId(id);

        if (!solicitud) {
            return null;
        }

        validarTransicionEstado(
            solicitud.estado,
            nuevoEstado
        );

        const solicitudActualizada =
            await this.solicitudRepository.actualizarEstado(
                id,
                nuevoEstado,
                solicitud.estado
            );

        if (solicitudActualizada) {
            return solicitudActualizada;
        }

        // Si no se actualizó, verificamos si fue eliminada
        // o modificada por otra operación.
        const solicitudActual =
            await this.solicitudRepository.buscarPorId(id);

        if (!solicitudActual) {
            return null;
        }

        throw new ConflictoActualizacionEstadoError();
    }
}
