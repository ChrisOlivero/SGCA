
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import pool from "./config/database.js";
import { swaggerDocument, swaggerHtml } from "./config/swagger.js";

import { SolicitudRepository } from "./repositories/solicitud.repository.impl.js";
import { SolicitudService } from "./services/solicitud.service.js";
import { SolicitudController } from "./controllers/solicitud.controller.js";
import { SolicitudRoutes } from "./routes/solicitud.routes.js";

const PORT = 3000;

const require = createRequire(import.meta.url);
const swaggerCssPath = require.resolve("swagger-ui-dist/swagger-ui.css");
const swaggerAssetsDirectory = dirname(swaggerCssPath);

const solicitudRepository = new SolicitudRepository();
const solicitudService = new SolicitudService(solicitudRepository);
const solicitudController = new SolicitudController(solicitudService);
const solicitudRoutes = new SolicitudRoutes(solicitudController);

const swaggerAssets: Record<string, {
    file: string;
    contentType: string;
}> = {
    "/api-docs/swagger-ui.css": {
        file: "swagger-ui.css",
        contentType: "text/css"
    },
    "/api-docs/swagger-ui-bundle.js": {
        file: "swagger-ui-bundle.js",
        contentType: "application/javascript"
    },
    "/api-docs/swagger-ui-standalone-preset.js": {
        file: "swagger-ui-standalone-preset.js",
        contentType: "application/javascript"
    }
};

// Centraliza la construcción de respuestas JSON.
function responderJson(
    response: import("node:http").ServerResponse,
    status: number,
    data: unknown
): void {
    response.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8"
    });

    response.end(JSON.stringify(data));
}

// Atiende la documentación y los recursos de Swagger.
async function manejarSwagger(
    request: import("node:http").IncomingMessage,
    response: import("node:http").ServerResponse,
    url: URL
): Promise<boolean> {
    if (
        request.method === "GET" &&
        (url.pathname === "/api-docs" || url.pathname === "/api-docs/")
    ) {
        response.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        response.end(swaggerHtml);
        return true;
    }

    if (
        request.method === "GET" &&
        url.pathname === "/api-docs/openapi.json"
    ) {
        responderJson(response, 200, swaggerDocument);
        return true;
    }

    const asset = swaggerAssets[url.pathname];

    if (request.method === "GET" && asset) {
        try {
            const content = await readFile(
                join(swaggerAssetsDirectory, asset.file)
            );

            response.writeHead(200, {
                "Content-Type": asset.contentType
            });

            response.end(content);
        } catch (error) {
            console.error("Error al cargar Swagger:", error);

            response.writeHead(500);
            response.end("No se pudo cargar un recurso de Swagger");
        }

        return true;
    }

    return false;
}

// Comprueba la conexión con PostgreSQL.
async function manejarHealthCheck(
    request: import("node:http").IncomingMessage,
    response: import("node:http").ServerResponse,
    url: URL
): Promise<boolean> {
    if (
        request.method !== "GET" ||
        url.pathname !== "/health/db"
    ) {
        return false;
    }

    try {
        const result = await pool.query(
            "SELECT NOW() AS fecha_servidor"
        );

        responderJson(response, 200, {
            mensaje: "Conexión con PostgreSQL exitosa",
            estado: "OK",
            fechaServidor: result.rows[0]?.fecha_servidor
        });
    } catch (error) {
        console.error(error);

        responderJson(response, 500, {
            mensaje: "Error de conexión con PostgreSQL"
        });
    }

    return true;
}

// Delega el procesamiento de las rutas de la aplicación.
async function manejarRutasApi(
    request: import("node:http").IncomingMessage,
    response: import("node:http").ServerResponse,
    url: URL
): Promise<void> {
    const encontrada = await solicitudRoutes.manejar(
        request,
        response,
        url
    );

    if (!encontrada) {
        responderJson(response, 404, {
            mensaje: "Ruta no encontrada"
        });
    }
}

// Coordina el procesamiento general de cada solicitud HTTP.
const server = createServer(async (request, response) => {
    const url = new URL(
        request.url ?? "/",
        `http://${request.headers.host ?? "localhost"}`
    );

    try {
        const swaggerAtendido = await manejarSwagger(
            request,
            response,
            url
        );

        if (swaggerAtendido) {
            return;
        }

        const healthCheckAtendido = await manejarHealthCheck(
            request,
            response,
            url
        );

        if (healthCheckAtendido) {
            return;
        }

        await manejarRutasApi(request, response, url);
    } catch (error) {
        console.error(error);

        if (!response.headersSent) {
            responderJson(response, 500, {
                mensaje: "Error interno del servidor"
            });
        }
    }
});

server.listen(PORT, () => {
    console.log(`Servidor SGCA ejecutándose en http://localhost:${PORT}`);
    console.log(`Documentación Swagger: http://localhost:${PORT}/api-docs`);
});
