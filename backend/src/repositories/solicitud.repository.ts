
import type {
    Solicitud,
    EstadoSolicitud
} from "../models/solicitud.js";


export interface CrearSolicitudDTO {
    descripcion?: string;
    tipo: Solicitud["tipo"];
    prioridad?: Solicitud["prioridad"];
    estudiante_id: number;
}

export interface ISolicitudRepository {
    crear(datos: CrearSolicitudDTO): Promise<Solicitud>;
    buscarPorId(id: number): Promise<Solicitud | null>;
    listar(): Promise<Solicitud[]>;
    existeEstudiante(id: number): Promise<boolean>;
    actualizarEstado(
        id: number,
        estado: EstadoSolicitud
    ): Promise<Solicitud | null>;
}
