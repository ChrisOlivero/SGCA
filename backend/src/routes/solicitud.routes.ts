
import type {
    IncomingMessage,
    ServerResponse
} from "node:http";

import { SolicitudController } from "../controllers/solicitud.controller.js";

export class SolicitudRoutes {
    constructor(
        private readonly controller: SolicitudController
    ) {}

    async manejar(
        request: IncomingMessage,
        response: ServerResponse,
        url: URL
    ): Promise<boolean> {
        const metodo = request.method;
        const ruta = url.pathname;

        if (metodo === "GET" && ruta === "/api/solicitudes") {
            await this.controller.listar(response);
            return true;
        }

        if (metodo === "POST" && ruta === "/api/solicitudes") {
            await this.controller.crear(request, response);
            return true;
        }

        const coincidencia = ruta.match(
            /^\/api\/solicitudes\/(\d+)(?:\/estado)?$/
        );

        if (coincidencia) {
            const id = Number(coincidencia[1]);

            if (metodo === "GET" && !ruta.endsWith("/estado")) {
                await this.controller.buscarPorId(response, id);
                return true;
            }

            if (metodo === "PATCH" && ruta.endsWith("/estado")) {
                await this.controller.actualizarEstado(
                    request,
                    response,
                    id
                );
                return true;
            }
        }

        return false;
    }
}
