
export const swaggerDocument = {
    openapi: "3.0.3",
    info: {
        title: "SGCA - Sistema de Gestión de Certificados Académicos",
        version: "1.0.0",
        description: "API para gestionar solicitudes de certificados académicos."
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Servidor local"
        }
    ],
    paths: {
        "/api/solicitudes": {
            get: {
                summary: "Listar solicitudes",
                tags: ["Solicitudes"],
                responses: {
                    "200": {
                        description: "Listado de solicitudes"
                    },
                    "500": {
                        description: "Error interno del servidor"
                    }
                }
            },
            post: {
                summary: "Crear una solicitud",
                tags: ["Solicitudes"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CrearSolicitud"
                            }
                        }
                    }
                },
                responses: {
                    "201": {
                        description: "Solicitud creada correctamente"
                    },
                    "400": {
                        description: "Datos inválidos"
                    },
                    "404": {
                        description: "Estudiante inexistente"
                    }
                }
            }
        },
        "/api/solicitudes/{id}": {
            get: {
                summary: "Consultar una solicitud",
                tags: ["Solicitudes"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Solicitud encontrada"
                    },
                    "404": {
                        description: "Solicitud no encontrada"
                    }
                }
            }
        },
        "/api/solicitudes/{id}/estado": {
            patch: {
                summary: "Actualizar el estado de una solicitud",
                tags: ["Solicitudes"],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer" }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ActualizarEstado"
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Estado actualizado"
                    },
                    "400": {
                        description: "Transición no permitida o datos inválidos"
                    },
                    "404": {
                        description: "Solicitud no encontrada"
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            CrearSolicitud: {
                type: "object",
                required: ["tipo", "estudiante_id"],
                properties: {
                    descripcion: {
                        type: "string",
                        example: "Solicitud de certificado para presentar en una institución"
                    },
                    tipo: {
                        type: "string",
                        enum: ["ALUMNO_REGULAR", "ANALITICO_PARCIAL"]
                    },
                    prioridad: {
                        type: "string",
                        enum: ["BAJA", "MEDIA", "ALTA"],
                        default: "MEDIA"
                    },
                    estudiante_id: {
                        type: "integer",
                        example: 1
                    }
                }
            },
            ActualizarEstado: {
                type: "object",
                required: ["estado"],
                properties: {
                    estado: {
                        type: "string",
                        enum: [
                            "PENDIENTE",
                            "EN_REVISION",
                            "APROBADA",
                            "RECHAZADA",
                            "FINALIZADA"
                        ]
                    }
                }
            }
        }
    }
};



export const swaggerHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>SGCA - Documentación API</title>
    <link rel="stylesheet" href="/api-docs/swagger-ui.css">
</head>
<body>
    <div id="swagger-ui"></div>

    <script src="/api-docs/swagger-ui-bundle.js"></script>
    <script src="/api-docs/swagger-ui-standalone-preset.js"></script>

    <script>
        SwaggerUIBundle({
            url: "/api-docs/openapi.json",
            dom_id: "#swagger-ui",
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout"
        });
    </script>
</body>
</html>
`;

