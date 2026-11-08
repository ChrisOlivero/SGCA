
import type {
    Solicitud,
    EstadoSolicitud
} from "../models/solicitud.js";

import type {
    CrearSolicitudDTO,
    ISolicitudRepository
} from "../repositories/solicitud.repository.js";

import { validarTransicionEstado } from "../domain/transiciones-solicitud.js";
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
            throw new Error("El estudiante no existe");
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

        return this.solicitudRepository.actualizarEstado(
            id,
            nuevoEstado
        );
    }
}
