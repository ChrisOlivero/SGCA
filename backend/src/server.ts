
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

const server = createServer(async (request, response) => {
    const url = new URL(
        request.url ?? "/",
        `http://${request.headers.host ?? "localhost"}`
    );

    if (request.method === "GET" && (
        url.pathname === "/api-docs" ||
        url.pathname === "/api-docs/"
    )) {
        response.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        response.end(swaggerHtml);
        return;
    }

    if (
        request.method === "GET" &&
        url.pathname === "/api-docs/openapi.json"
    ) {
        response.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8"
        });

        response.end(JSON.stringify(swaggerDocument));
        return;
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

        return;
    }

    if (url.pathname === "/health/db" && request.method === "GET") {
        try {
            const result = await pool.query(
                "SELECT NOW() AS fecha_servidor"
            );

            response.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8"
            });

            response.end(JSON.stringify({
                mensaje: "Conexión con PostgreSQL exitosa",
                estado: "OK",
                fechaServidor: result.rows[0]?.fecha_servidor
            }));
        } catch (error) {
            console.error(error);

            response.writeHead(500, {
                "Content-Type": "application/json; charset=utf-8"
            });

            response.end(JSON.stringify({
                mensaje: "Error de conexión con PostgreSQL"
            }));
        }

        return;
    }

    try {
        const encontrada = await solicitudRoutes.manejar(
            request,
            response,
            url
        );

        if (encontrada) {
            return;
        }

        response.writeHead(404, {
            "Content-Type": "application/json; charset=utf-8"
        });

        response.end(JSON.stringify({
            mensaje: "Ruta no encontrada"
        }));
    } catch (error) {
        console.error(error);

        if (!response.headersSent) {
            response.writeHead(500, {
                "Content-Type": "application/json; charset=utf-8"
            });

            response.end(JSON.stringify({
                mensaje: "Error interno del servidor"
            }));
        }
    }
});

server.listen(PORT, () => {
    console.log(`Servidor SGCA ejecutándose en http://localhost:${PORT}`);
    console.log(`Documentación Swagger: http://localhost:${PORT}/api-docs`);
});
